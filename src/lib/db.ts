import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client singleton.
 *
 * Trong môi trường dev (hot-reload), Next.js load lại module liên tục.
 * Dùng `globalThis` để tái sử dụng connection pool, tránh mở quá nhiều
 * kết nối tới database — đặc biệt quan trọng khi deploy lên Vercel (serverless).
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    // Prisma 7 yêu cầu driver adapter (ở đây dùng Postgres).
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    });

    return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
