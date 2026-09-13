import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { UserRole } from "../generated/prisma/client.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function getActivities(userId: number, role: UserRole) {

    let where = {};

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
            task: {
                assignedDeveloperId: userId,
            },
        };
    }

    const activities = await prisma.activityLog.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        take: 20,

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            project: true,
            task: true,
        },
    });

    return activities;
}