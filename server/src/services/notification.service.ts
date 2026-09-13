import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

export async function createNotification(
  userId: number,
  message: string
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
    },
  });

  return notification;
}

export async function getNotifications(userId: number) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}