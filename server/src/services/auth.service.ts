import { PrismaClient, UserRole } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const adapter = new PrismaPg({
    connectionString: env.databaseUrl,
});

const prisma = new PrismaClient({
    adapter,
});

export async function registerUser(name: string, email: string, password: string, role: UserRole) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (existingUser) {
        throw new Error("This user already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            passwordHash: passwordHash,
            role: role,
        },
    })

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (!user) {
        throw new Error("User does not exists");
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("Invalid Password");
    }
    const accessToken = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        env.accessTokenSecret,
        {
            expiresIn: "15m"
        }
    );
    const refreshToken = jwt.sign(
        {
            userId: user.id
        },
        env.refreshTokenSecret,
        {
            expiresIn: "7d"
        }
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.refreshToken.create({
        data: {
            tokenHash: refreshTokenHash,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });

    return {
        accessToken, refreshToken,
    };
}

export async function refreshUser(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, env.refreshTokenSecret);

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "number"
    ) {
        throw new Error("Invalid refresh token");
    }

    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            userId: decoded.userId,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (!storedToken) {
        throw new Error("Invalid or expired refresh token");
    }

    const isValid = await bcrypt.compare(
        refreshToken,
        storedToken.tokenHash
    );

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId,
        },
    });
    if (!isValid) {
        throw new Error("Invalid refresh token");
    }

    if (!user) {
        throw new Error("User not found");
    }

    const accessToken = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        env.accessTokenSecret,
        {
            expiresIn: "15m"
        }
    );
    return accessToken;
}
