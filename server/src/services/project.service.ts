import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function createProject(
    name: string,
    description: string | undefined,
    clientId: number,
    managerId: number
) {
    const manager = await prisma.user.findUnique({
        where: {
            id: managerId,
        },
    });

    if (!manager) {
        throw new Error("Manager not found");
    }

    if (manager.role !== "PROJECT_MANAGER") {
        throw new Error("User is not a Project Manager");
    }

    const client = await prisma.client.findUnique({
        where: {
            id: clientId,
        },
    });

    if (!client) {
        throw new Error("Client not found");
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            clientId,
            managerId,
        },
    });

    return project;

}

export async function getProjects(managerId: number) {
    const projects = await prisma.project.findMany({
        where: {
            managerId: managerId,
        },
        include: {
            client: true,
            manager: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return projects;
}

export async function updateProject(projectId: number, managerId: number, name: string, description: string, clientId: number | undefined
) {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    if (project.managerId !== managerId) {
        throw new Error("You can only manage your own projects");
    }

    const updatedProject = await prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            name,
            description,
            clientId,
        },
    });
    return updatedProject;
}