import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

/**
 * Seed script — tạo 38 phòng cố định, cài đặt đơn giá mặc định,
 * và một tài khoản ADMIN mặc định.
 * Chạy bằng: npm run db:seed
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Danh sách 38 phòng: tầng 1: 102-105; tầng 2-5: x01-x06; tầng 6-7: x01-x05.
const FLOORS: Record<number, number[]> = {
    1: [102, 103, 104, 105],
    2: [201, 202, 203, 204, 205, 206],
    3: [301, 302, 303, 304, 305, 306],
    4: [401, 402, 403, 404, 405, 406],
    5: [501, 502, 503, 504, 505, 506],
    6: [601, 602, 603, 604, 605],
    7: [701, 702, 703, 704, 705],
};

async function main() {
    console.log("🧹 Xoá dữ liệu cũ...");
    await prisma.transferRecord.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.meterReading.deleteMany();
    await prisma.billingPeriod.deleteMany();
    await prisma.lease.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.room.deleteMany();
    await prisma.setting.deleteMany();

    console.log("🏢 Tạo 38 phòng...");
    for (const [floor, numbers] of Object.entries(FLOORS)) {
        for (const number of numbers) {
            await prisma.room.create({
                data: {
                    number: String(number),
                    floor: Number(floor),
                    baseRent: 3000000,
                    status: "VACANT",
                },
            });
        }
    }

    console.log("⚙️ Cài đặt đơn giá mặc định...");
    await prisma.setting.create({
        data: {
            key: "fees",
            value: {
                electricityUnitPrice: 3500,
                waterUnitPrice: 25000,
                motorcycleUnitPrice: 100000,
                cleaningFee: 30000,
                internetFee: 100000,
                elevatorFee: 50000,
                dueDay: 5,
            },
        },
    });

    console.log("👤 Tạo tài khoản ADMIN mặc định (admin@tro.vn / admin123)...");
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
        data: {
            email: "admin@tro.vn",
            passwordHash,
            name: "Chủ nhà",
            role: "ADMIN",
            mustChangePassword: true,
        },
    });

    console.log("✅ Seed hoàn tất!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
