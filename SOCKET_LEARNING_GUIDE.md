# Socket.IO + Redis Multi-Instance Learning Guide

## Table of Contents
1. [Basic Concepts](#basic-concepts)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Testing & Debugging](#testing--debugging)
4. [Common Patterns](#common-patterns)

---

## Basic Concepts

### What is Socket.IO?
Socket.IO enables real-time, bidirectional communication between client and server using WebSockets.

**Key Concepts:**
- **Connection**: Persistent connection between client and server
- **Events**: Custom messages sent between client/server (like `message:send`, `typing:start`)
- **Rooms**: Groups that sockets can join/leave (like chat rooms or user-specific channels)
- **Namespaces**: Separate communication channels on same connection

### Why Redis Adapter?
Without Redis, each server instance is isolated:
```
User A (Pod 1) → Cannot communicate → User B (Pod 2)
```

With Redis Pub/Sub:
```
User A (Pod 1) → Redis → User B (Pod 2) ✓
```

---

## Step-by-Step Implementation

### Step 1: Basic Socket.IO Setup (Single Instance)

Start simple without Redis:

```javascript
// src/config/socket-basic.js
import { Server } from 'socket.io';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Listen for messages
        socket.on('message', (data) => {
            console.log('Received:', data);
            
            // Broadcast to all clients
            io.emit('message', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};
```

**Test this first!** Make sure basic Socket.IO works before adding Redis.

---

### Step 2: Add Authentication

```javascript
// Add auth middleware
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('No token'));
    }

    // Verify token (your auth logic)
    const user = await verifyToken(token);
    
    if (!user) {
        return next(new Error('Invalid token'));
    }

    // Attach user info to socket
    socket.userId = user.userId;
    socket.username = user.username;
    
    next();
});
```

**Key Learning:** Middleware runs before connection is established.

---

### Step 3: Implement Rooms (User-Specific Channels)

```javascript
io.on('connection', (socket) => {
    // Each user joins their own room
    socket.join(`user:${socket.userId}`);
    
    console.log(`${socket.username} joined room: user:${socket.userId}`);

    // Send message to specific user
    socket.on('private-message', (data) => {
        const { recipientId, message } = data;
        
        // Send only to recipient's room
        io.to(`user:${recipientId}`).emit('message', {
            from: socket.username,
            message: message
        });
    });
});
```

**Key Learning:** Rooms allow targeted message delivery.

---

### Step 4: Add Redis Adapter (Multi-Instance Support)

```javascript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Create two Redis clients (pub/sub pattern)
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

// Connect both clients
await pubClient.connect();
await subClient.connect();

// Attach adapter to Socket.IO
io.adapter(createAdapter(pubClient, subClient));
```

**Key Learning:** 
- `pubClient`: Publishes events to Redis
- `subClient`: Subscribes to events from Redis
- When you emit to a room, Redis broadcasts to all server instances

---

### Step 5: Test Multi-Instance Setup

**Terminal 1:**
```bash
PORT=5001 npm run dev
```

**Terminal 2:**
```bash
PORT=5002 npm run dev
```

**Terminal 3:**
```bash
PORT=5003 npm run dev
```

**Test scenario:**
1. User A connects to Pod 1 (port 5001)
2. User B connects to Pod 2 (port 5002)
3. User A sends message to User B
4. Redis routes the message from Pod 1 → Pod 2 ✓

---

## Testing & Debugging

### Test with Postman/Thunder Client

**1. Connect to Socket.IO:**
```javascript
// In browser console or test client
const socket = io('http://localhost:5001', {
    auth: {
        token: 'your-jwt-token'
    }
});

socket.on('connect', () => {
    console.log('Connected:', socket.id);
});

socket.on('message', (data) => {
    console.log('Received:', data);
});

socket.emit('message', { text: 'Hello!' });
```

**2. Monitor Redis:**
```bash
# Connect to Redis CLI
docker exec -it redis_cache redis-cli

# Monitor all commands
MONITOR

# You'll see Socket.IO events being published
```

**3. Check Socket.IO Admin UI:**
```bash
npm install @socket.io/admin-ui

# Add to your socket config
import { instrument } from "@socket.io/admin-ui";
instrument(io, { auth: false });

# Visit: http://localhost:5001/admin
```

---

## Common Patterns

### Pattern 1: Broadcast to All Users
```javascript
io.emit('announcement', { message: 'Server maintenance in 5 minutes' });
```

### Pattern 2: Send to Specific User
```javascript
io.to(`user:${userId}`).emit('notification', { text: 'New message' });
```

### Pattern 3: Send to All Except Sender
```javascript
socket.broadcast.emit('user-joined', { username: socket.username });
```

### Pattern 4: Room-Based Chat
```javascript
// Join chat room
socket.on('join-room', (roomId) => {
    socket.join(`room:${roomId}`);
    io.to(`room:${roomId}`).emit('user-joined', socket.username);
});

// Send to room
socket.on('room-message', (data) => {
    io.to(`room:${data.roomId}`).emit('message', {
        from: socket.username,
        text: data.text
    });
});
```

### Pattern 5: Typing Indicator
```javascript
socket.on('typing-start', (recipientId) => {
    io.to(`user:${recipientId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username
    });
});

socket.on('typing-stop', (recipientId) => {
    io.to(`user:${recipientId}`).emit('user-stopped-typing', {
        userId: socket.userId
    });
});
```

---

## Hands-On Exercises

### Exercise 1: Echo Server
Build a simple echo server that sends back whatever the client sends.

```javascript
socket.on('echo', (data) => {
    socket.emit('echo-response', data);
});
```

### Exercise 2: Online Users List
Track and broadcast online users.

```javascript
const onlineUsers = new Map();

io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.username);
    io.emit('online-users', Array.from(onlineUsers.values()));

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.userId);
        io.emit('online-users', Array.from(onlineUsers.values()));
    });
});
```

### Exercise 3: Private Chat Rooms
Create 1-on-1 chat rooms between users.

```javascript
function getChatRoomId(userId1, userId2) {
    return [userId1, userId2].sort().join('-');
}

socket.on('start-chat', (recipientId) => {
    const roomId = getChatRoomId(socket.userId, recipientId);
    socket.join(roomId);
    
    io.to(`user:${recipientId}`).emit('chat-request', {
        from: socket.username,
        roomId: roomId
    });
});

socket.on('send-message', (data) => {
    io.to(data.roomId).emit('message', {
        from: socket.username,
        text: data.text
    });
});
```

---

## Debugging Tips

### 1. Enable Socket.IO Debug Logs
```bash
DEBUG=socket.io* npm run dev
```

### 2. Check Redis Connections
```bash
docker exec -it redis_cache redis-cli
CLIENT LIST
```

### 3. Monitor Events
```javascript
io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
        console.log(`Event: ${event}`, args);
    });
});
```

### 4. Test Connection Issues
```javascript
socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});
```

---

## Next Steps

1. **Start with Exercise 1** - Build the echo server
2. **Add authentication** - Implement token verification
3. **Test with 2 browser tabs** - Send messages between them
4. **Add Redis** - Test with multiple server instances
5. **Build features** - Typing indicators, read receipts, etc.

## Resources

- Socket.IO Docs: https://socket.io/docs/v4/
- Redis Adapter: https://socket.io/docs/v4/redis-adapter/
- Testing: https://socket.io/docs/v4/testing/

---

## Common Issues & Solutions

**Issue:** "Socket.IO not connecting"
- Check CORS settings
- Verify server is running
- Check browser console for errors

**Issue:** "Messages not reaching other pods"
- Verify Redis is running: `docker ps`
- Check Redis adapter is initialized
- Monitor Redis: `redis-cli MONITOR`

**Issue:** "Authentication failing"
- Check token format in handshake
- Verify token verification logic
- Log errors in middleware

---

Happy learning! Start with the basic setup and gradually add complexity.
