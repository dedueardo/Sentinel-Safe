import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes";
import cameraRoutes from "./routes/cameraRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/users", userRoutes);
app.use("/cameras", cameraRoutes);
app.use("/auth", authRoutes);

export default app;
