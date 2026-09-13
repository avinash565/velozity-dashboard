import { Request, Response, NextFunction } from "express";
import { createProject } from "../services/project.service.js";
import { getProjects } from "../services/project.service.js";
import { updateProject } from "../services/project.service.js";
import { AppError } from "../utils/AppError.js";

export async function createProjectController(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, clientId } = req.body;
        if (!name || typeof name !== "string" || !name.trim()) {
            throw new AppError("Project name is required", 400);
        }

        if (!Number.isInteger(Number(clientId)) || Number(clientId) <= 0) {
            throw new AppError("Valid clientId is required", 400);
        }
        const clientIdNumber = Number(clientId);

        // authenticated user ka ID yahan se milega
        const managerId = req.user?.userId;

        if (!managerId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const project = await createProject(
            name,
            description,
            clientIdNumber,
            managerId
        );

        return res.status(201).json({
            project,
        });

    } catch (error) {
         next(error);
    }
}

export async function getProjectsController(req: Request,res: Response, next: NextFunction) {
    try {
        const managerId = req.user?.userId;

        if (!managerId) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const projects = await getProjects(managerId);

        return res.status(200).json({
            projects,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateProjectController(req: Request, res: Response, next: NextFunction) {
    try {
        const projectId = Number(req.params.projectId);
        const { name, description, clientId } = req.body;
        const managerId = req.user?.userId;
        if (!managerId) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }
        const updatedProject = await updateProject(
            projectId,
            managerId,
            name,
            description,
            clientId
        );
        return res.status(200).json({
            updatedProject
        });
    } catch (error) {
        next(error);
    }
}