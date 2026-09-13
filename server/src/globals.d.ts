import { UserRole } from "./generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        name: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export { };