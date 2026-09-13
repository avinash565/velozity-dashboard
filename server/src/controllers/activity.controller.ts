import { Request, Response } from "express";
import { getActivities } from "../services/activity.service.js";

export async function getActivitiesController(req: Request,res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const { userId, role } = req.user;
    const activities = await getActivities(userId, role);

    return res.status(200).json({
      activities,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
}