import { registerUser } from "../services/auth.service.js";
import { Request, Response } from "express";
import { loginUser } from "../services/auth.service.js";
import { refreshUser } from "../services/auth.service.js";
import { UserRole } from "../generated/prisma/enums.js";
import { NextFunction } from "express";

export async function registerController(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;

        const user = await registerUser(name, email, password, UserRole.DEVELOPER);

        return res.status(201).json({
            user
        })
    } catch (error) {
        next(error);
    }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
        });

        return res.status(200).json({
            accessToken: result.accessToken
        });
    } catch (error) {
        next(error);
    }
}

export async function refreshController(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token is required",
        });
    }

    const result = await refreshUser(refreshToken);

    return res.status(200).json({
        accessToken: result,
    });
}