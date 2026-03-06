import prisma from '../config/prisma.js';
import { getIO } from '../socket/index.js';

export const groupService = {
    // Create a new group
    async createGroup(createdById, name, description = null, memberIds = []) {
        const group = await prisma.group.create({
            data: {
                name,
                description,
                createdById,
                members: {
                    create: [
                        // Add creator as owner
                        { userId: createdById, role: 'owner' },
                        // Add other members
                        ...memberIds.map(userId => ({ userId, role: 'member' }))
                    ]
                }
            },
            include: {
                createdBy: {
                    select: { id: true, username: true }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true }
                        }
                    }
                }
            }
        });

        return group;
    },

    // Save a group message to database
    async saveGroupMessage(senderId, groupId, content, messageType = 'text') {
        // Verify user is a member of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: senderId
                }
            }
        });

        if (!membership) {
            throw new Error('User is not a member of this group');
        }

        // Save the message
        const message = await prisma.message.create({
            data: {
                userId: senderId,
                groupId,
                content,
                messageType
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        // Update group's last message time
        await prisma.group.update({
            where: { id: groupId },
            data: { lastMessageAt: new Date() }
        });

        return message;
    },

    // Get group messages (chat history)
    async getGroupMessages(groupId, userId, limit = 50) {
        // Verify user is a member
        const membership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });

        if (!membership) {
            throw new Error('User is not a member of this group');
        }

        const messages = await prisma.message.findMany({
            where: { groupId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: limit
        });

        return messages;
    },

    // Get all groups for a user
    async getUserGroups(userId) {
        const memberships = await prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        createdBy: {
                            select: { id: true, username: true }
                        },
                        members: {
                            include: {
                                user: {
                                    select: { id: true, username: true }
                                }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: {
                                sender: {
                                    select: { id: true, username: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                group: {
                    lastMessageAt: 'desc'
                }
            }
        });

        return memberships.map(m => ({
            ...m.group,
            userRole: m.role,
            lastMessage: m.group.messages[0] || null
        }));
    },

    // Add member to group
    async addMember(groupId, userId, addedBy, role = 'member') {
        // Verify addedBy is admin or owner
        const adderMembership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: addedBy
                }
            }
        });

        if (!adderMembership || !['admin', 'owner'].includes(adderMembership.role)) {
            throw new Error('Only admins and owners can add members');
        }

        const member = await prisma.groupMember.create({
            data: {
                groupId,
                userId,
                role
            },
            include: {
                user: {
                    select: { id: true, username: true }
                }
            }
        });

        return member;
    },

    // Remove member from group
    async removeMember(groupId, userId, removedBy) {
        // Verify removedBy is admin or owner
        const removerMembership = await prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId: removedBy
                }
            }
        });

        if (!removerMembership || !['admin', 'owner'].includes(removerMembership.role)) {
            throw new Error('Only admins and owners can remove members');
        }

        await prisma.groupMember.delete({
            where: {
                groupId_userId: {
                    groupId,
                    userId
                }
            }
        });
    },

    // Emit message to all group members
    emitToGroup(groupId, event, data) {
        const io = getIO();
        io.to(`group:${groupId}`).emit(event, data);
    }
};
