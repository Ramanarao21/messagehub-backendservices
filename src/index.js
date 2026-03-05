import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { initializeSocket } from "./socket/index.js";

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Server is Running" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Initialize Socket.IO with Redis adapter
initializeSocket(server);

server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});




