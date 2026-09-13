import dotenv from "dotenv";

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
};