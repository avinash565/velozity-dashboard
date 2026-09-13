import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { TaskPriority, TaskStatus } from "../generated/prisma/enums.js";
import { broadcastActivity } from "../websocket.js";
import { UserRole } from "../generated/prisma/enums.js";
import { AppError } from "../utils/AppError.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function createTask(title: string, description: string | undefined, projectId: number, assignedDeveloperId: number, priority: TaskPriority, dueDate: Date, managerId: number) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        throw new AppError("Project not found", 404);
    }
    if (project.managerId !== managerId) {
        throw new AppError(
            "You can only manage tasks in your own projects",
            403
        );
    }

    const developer = await prisma.user.findUnique({
        where: {
            id: assignedDeveloperId,
        },
    });

    if (!developer) {
        throw new AppError("Developer not found", 404);
    }

    if (developer.role !== "DEVELOPER") {
        throw new AppError("User is not a Developer", 400);
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            projectId,
            assignedDeveloperId,
            status: TaskStatus.TODO,
            priority,
            dueDate,
        },
    });

    return task;
}

export async function getTasks(userId: number, role: UserRole, status?: TaskStatus, priority?: TaskPriority, dueDateFrom?: Date, dueDateTo?: Date) {
    let where: any = {};

    if (role === UserRole.ADMIN) {
        where = {};
    }

    if (role === UserRole.PROJECT_MANAGER) {
        where = {
            project: {
                managerId: userId,
            },
        };
    }

    if (role === UserRole.DEVELOPER) {
        where = {
            assignedDeveloperId: userId,
        };
    }

    if (status) {
        where.status = status;
    }

    if (priority) {
        where.priority = priority;
    }

    if (dueDateFrom || dueDateTo) {
        where.dueDate = {};

        if (dueDateFrom) {
            where.dueDate.gte = dueDateFrom;
        }

        if (dueDateTo) {
            where.dueDate.lte = dueDateTo;
        }
    }

    const tasks = await prisma.task.findMany({
        where,
        include: {
            project: true,
            assignedDeveloper: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return tasks;
}

export async function updateTaskStatus(taskId: number, userId: number, role: UserRole, newStatus: TaskStatus) {
    const task = await prisma.task.findUnique({
        where: {
            id: taskId,
        },
    });
    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (role === UserRole.DEVELOPER) {
        if (task.assignedDeveloperId !== userId) {
            throw new AppError("You can only update your own tasks", 403);
        }
    }

    if (role === UserRole.PROJECT_MANAGER) {
        const project = await prisma.project.findUnique({
            where: {
                id: task.projectId,
            },
        });

        if (!project || project.managerId !== userId) {
            throw new AppError("You can only manage your own projects", 403);
        }
    }
    const oldStatus = task.status;

    const result = await prisma.$transaction(async (tx) => {
        const updatedTask = await tx.task.update({
            where: {
                id: taskId,
            },
            data: {
                status: newStatus,
            },
        });

        const activity = await tx.activityLog.create({
            data: {
                projectId: task.projectId,
                taskId: task.id,
                userId: userId,
                action: "TASK_STATUS_CHANGED",
                oldStatus: oldStatus,
                newStatus: newStatus,
            },
        });

        return { updatedTask, activity };
    });

    broadcastActivity(result.activity);

    return result.updatedTask;
}