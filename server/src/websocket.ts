import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { UserRole } from "./generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

type ActivityData = {
    id: number;
    projectId: number;
    taskId: number | null;
    userId: number;
    action: string;
};

type ConnectedClient = {
    socket: WebSocket;
    userId: number;
    role: UserRole;
};
const clients = new Set<ConnectedClient>();




export function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (socket) => {
        socket.on("message", async (message) => {
            try {
                const data = JSON.parse(message.toString());

                if (data.type !== "AUTH") {
                    socket.close();
                    return;
                }

                const token = data.token;
                const decoded = jwt.verify(token, env.accessTokenSecret);
                console.log(decoded);
                if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
                    socket.close();
                    return;
                }

                const userId = Number(decoded.userId);

                if (!Number.isInteger(userId)) {
                    socket.close();
                    return;
                }
                const user = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });

                if (!user || !token) {
                    socket.close();
                    return;
                }
                const client: ConnectedClient = {
                    socket: socket,
                    userId: user.id,
                    role: user.role,
                };

                clients.add(client);
                socket.send(
                    JSON.stringify({
                        type: "AUTH_SUCCESS",
                    })
                );
                socket.on("close", () => {
                    clients.delete(client);
                });


            } catch (error) {
                console.error("WebSocket error:", error);
                socket.close();
            }
        });
    });
}

export async function broadcastActivity(activity: ActivityData) {
    const message = JSON.stringify({
        type: "ACTIVITY",
        data: activity,
    });

    clients.forEach(async (client) => {

        if (client.socket.readyState === WebSocket.OPEN) {
            if (client.role === UserRole.ADMIN) {
                client.socket.send(message);
                return;
            }

            if (client.role === UserRole.PROJECT_MANAGER) {
                const project = await prisma.project.findUnique({
                    where: {
                        id: activity.projectId,
                    },
                });

                if (project?.managerId === client.userId) {
                    client.socket.send(message);
                }

                return;
            }

            if (client.role === UserRole.DEVELOPER) {
                const task = activity.taskId
                    ? await prisma.task.findUnique({
                        where: {
                            id: activity.taskId,
                        },
                    })
                    : null;

                if (task?.assignedDeveloperId === client.userId) {
                    client.socket.send(message);
                }
                return;
            }
            
        }

    });

}