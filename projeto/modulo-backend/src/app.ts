import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import cameraRoutes from "./routes/cameraRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(express.json());

// 🟢 Habilitar CORS
app.use(
    cors({
        origin: "http://localhost:5173", // endereço do seu frontend (Vite)
        credentials: true, // permite cookies e headers de autenticação
    })
);

// 🛣️ Suas rotas
app.use("/users", userRoutes);
app.use("/cameras", cameraRoutes);
app.use("/auth", authRoutes);

export default app;
