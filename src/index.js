import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dmRoutes from "./routes/dmRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initializeSocket } from "./socket/index.js";

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Server is Running" });
});

// Auth routes
app.use("/api/auth", authRoutes);
// User routes
app.use("/api/users", userRoutes);
// DM routes
app.use("/api/dm", dmRoutes);
// Group routes
app.use("/api/groups", groupRoutes);
// Message routes (DMs)
app.use("/api/messages", messageRoutes);

// Initialize Socket.IO with Redis adapter
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});




