// Complete test flow: Register → Login → Connect Socket.IO
// Run with: node test-flow.js

import fetch from 'node-fetch';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5002';

async function testCompleteFlow() {
    console.log('=== Testing Complete Authentication Flow ===\n');

    // Step 1: Register User
    console.log('Step 1: Registering user...');
    try {
        const registerResponse = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const registerData = await registerResponse.json();
        console.log('✓ User registered:', registerData);
    } catch (error) {
        console.log('User might already exist, continuing...');
    }

    // Step 2: Login
    console.log('\nStep 2: Logging in...');
    const loginResponse = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        })
    });

    const loginData = await loginResponse.json();
    console.log('✓ Login successful!');
    console.log('Token:', loginData.token);
    console.log('User:', loginData.user);

    // Step 3: Connect to Socket.IO with token
    console.log('\nStep 3: Connecting to Socket.IO with token...');
    const socket = io(SERVER_URL, {
        auth: {
            token: loginData.token  // ← This is how token is passed
        }
    });

    socket.on('connect', () => {
        console.log('✓ Socket.IO connected!');
        console.log('Socket ID:', socket.id);
        console.log('\n=== Connection Successful! ===');
        
        // Clean up
        setTimeout(() => {
            socket.disconnect();
            process.exit(0);
        }, 2000);
    });

    socket.on('connect_error', (error) => {
        console.error('✗ Connection failed:', error.message);
        process.exit(1);
    });

    socket.on('user:online', (data) => {
        console.log('User online event:', data);
    });
}

// Run the test
testCompleteFlow().catch(console.error);
