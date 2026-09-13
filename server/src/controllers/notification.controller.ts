import { Request, Response } from "express";
import { getNotifications } from "../services/notification.service.js";

export async function getNotificationsController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notifications = await getNotifications(userId);

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
}