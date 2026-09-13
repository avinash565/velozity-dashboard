import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../generated/prisma/enums.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access token is required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, env.accessTokenSecret);

        // console.log(decoded);

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "number"
        ) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            },
        });
        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        req.user = {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };


        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }

}

export function authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to access this resource",
            });
        }

        next();
    };
}