import nodeCron from "node-cron";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function markOverdueTasks() {
    const now = new Date();

    const overdueTasks = await prisma.task.findMany({
        where: {
            dueDate: {
                lt: now
            },
            isOverdue: false
        },
    });
    console.log("Overdue tasks found:", overdueTasks);

    await prisma.task.updateMany({
        where: {
            dueDate: {
                lt: now
            },
            isOverdue: false
        },
        data: {
            isOverdue: true
        }
    });

    for (const task of overdueTasks) {
        await prisma.notification.create({
            data: {
                userId: task.assignedDeveloperId,
                message: `Your task "${task.title}" has been marked as overdue`,
            },
        });
    }
}

export function startOverdueJob() {
    nodeCron.schedule("*/5 * * * *", async () => {
        await markOverdueTasks();
    });
}