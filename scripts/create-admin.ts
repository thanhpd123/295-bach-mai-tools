import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

/**
 * Tạo/cập nhật tài khoản ADMIN — KHÔNG xoá dữ liệu (an toàn chạy trên production).
 * Đọc thông tin đăng nhập từ biến môi trường:
 *   ADMIN_USERNAME (mặc định: admin)
 *   ADMIN_PASSWORD (bắt buộc, tối thiểu 8 ký tự — không được hardcode trong repo)
 *   ADMIN_NAME     (mặc định: Chủ nhà)
 *
 * Chạy bằng: npm run db:create-admin
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Thiếu biến môi trường ${name}.`);
    }
    return value;
}

async function main() {
    const username = process.env.ADMIN_USERNAME ?? "admin";
    const password = requiredEnv("ADMIN_PASSWORD");
    const name = process.env.ADMIN_NAME ?? "Chủ nhà";

    if (password.length < 8) {
        throw new Error(
            "❌ ADMIN_PASSWORD phải có ít nhất 8 ký tự (nên dùng từ 12 ký tự trở lên).",
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({
        where: { username },
    });

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                username,
                passwordHash,
                name,
                role: "ADMIN",
                isActive: true,
                mustChangePassword: false,
                failedAttempts: 0,
                lockedUntil: null,
            },
        });
        console.log(`✅ Đã cập nhật tài khoản ADMIN: ${username}`);
    } else {
        await prisma.user.create({
            data: {
                username,
                passwordHash,
                name,
                role: "ADMIN",
                mustChangePassword: false,
            },
        });
        console.log(`✅ Đã tạo tài khoản ADMIN: ${username}`);
    }

    console.log("💡 Không in mật khẩu ra màn hình — hãy lưu mật khẩu ở nơi an toàn.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
