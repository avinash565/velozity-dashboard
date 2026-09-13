import { createTask } from "../services/task.service.js";
import { Request, Response } from "express";
import { updateTaskStatus } from "../services/task.service.js";
import { TaskStatus, TaskPriority } from "../generated/prisma/enums.js";
import { getTasks } from "../services/task.service.js";
import { NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export async function createTaskController(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            title,
            description,
            projectId,
            assignedDeveloperId,
            priority,
            dueDate,
        } = req.body;
        if (!title || typeof title !== "string" || !title.trim()) {
            throw new AppError("Title is required", 400);
        }
        if (!Number.isInteger(projectId) || projectId <= 0) {
            throw new AppError("Valid projectId is required", 400);
        }

        if (!Number.isInteger(assignedDeveloperId) || assignedDeveloperId <= 0) {
            throw new AppError("Valid assignedDeveloperId is required", 400);
        }
        if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
            throw new AppError(
                "Priority must be LOW, MEDIUM, or HIGH",
                400
            );
        }
        if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) {
            throw new AppError("Valid dueDate is required", 400);
        }
        const projectIdNumber = Number(projectId);
        const developerIdNumber = Number(assignedDeveloperId);
        const dueDateValue = new Date(dueDate);
        const userId = req.user?.userId;

        if (!userId) {
            throw new AppError("Authentication required", 401);
        }
        const task = await createTask(
            title,
            description,
            projectIdNumber,
            developerIdNumber,
            priority,
            dueDateValue,
            userId
        );
        return res.status(201).json({
            task,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTasksController(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { status, priority, dueDateFrom, dueDateTo } = req.query;

        const tasks = await getTasks(
  req.user.userId,
  req.user.role,
  status as TaskStatus | undefined,
  priority as TaskPriority | undefined,
  dueDateFrom ? new Date(String(dueDateFrom)) : undefined,
  dueDateTo ? new Date(String(dueDateTo)) : undefined
);

        return res.status(200).json({
            tasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch tasks",
        });
    }
}

export async function updateTaskStatusController(req: Request, res: Response, next: NextFunction) {
    try {
        const taskId = Number(req.params.taskId);

        const { status } = req.body;
        if (!Object.values(TaskStatus).includes(status)) {
            throw new AppError("Invalid task status", 400);
        }

        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const updatedTask = await updateTaskStatus(taskId, userId, req.user!.role, status as TaskStatus);

        return res.status(200).json({
            task: updatedTask,
        });
    } catch (error) {
        next(error);

    }
}