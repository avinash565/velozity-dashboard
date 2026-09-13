import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js"
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import { createServer } from "http";
import { setupWebSocket } from "./websocket.js";
import { startOverdueJob } from "./jobs/overdue.job.js";
import notificationRoutes from "./routes/notification.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/activities", activityRoutes);
app.use("/notifications", notificationRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Velozity Dashboard API is running",
  });
});
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);
setupWebSocket(httpServer);
startOverdueJob();
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});