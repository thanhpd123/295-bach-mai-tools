import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import type { FeeType } from "../src/generated/prisma/enums";

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

type DemoLine = {
    feeType: FeeType;
    description: string;
    quantity: number;
    unitPrice: number;
};

/** Tạo một hoá đơn PENDING cùng các dòng phí (tổng tiền tự tính). */
async function createDemoInvoice(input: {
    code: string;
    roomId: string;
    tenantId: string;
    billingPeriodId: string;
    dueDate: Date;
    lines: DemoLine[];
}) {
    const totalAmount = input.lines.reduce(
        (sum, l) => sum + l.quantity * l.unitPrice,
        0,
    );
    await prisma.invoice.create({
        data: {
            code: input.code,
            roomId: input.roomId,
            billingPeriodId: input.billingPeriodId,
            tenantId: input.tenantId,
            status: "PENDING",
            dueDate: input.dueDate,
            totalAmount,
            items: {
                create: input.lines.map((l) => ({
                    ...l,
                    total: l.quantity * l.unitPrice,
                })),
            },
        },
    });
}

async function main() {
    // Chốt chặn an toàn: seed XOÁ TOÀN BỘ dữ liệu rồi tạo lại, nên không bao giờ
    // được phép chạy trên môi trường production.
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "❌ Không được chạy seed trên môi trường production! " +
            "Script này xoá toàn bộ dữ liệu rồi tạo lại dữ liệu demo.",
        );
    }

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

    console.log("👤 Tạo tài khoản ADMIN mặc định (admin / bachmai295)...");
    const passwordHash = await bcrypt.hash("bachmai295", 12);
    await prisma.user.create({
        data: {
            username: "admin",
            passwordHash,
            name: "Chủ nhà",
            role: "ADMIN",
            mustChangePassword: false,
        },
    });

    // ------------------------------------------------------------
    // Dữ liệu demo cho MVP: 2 khách thuê, hợp đồng, kỳ 2026-08,
    // chỉ số điện/nước, hoá đơn, tài khoản ngân hàng, giao dịch mẫu.
    // ------------------------------------------------------------

    console.log("🧑‍🤝‍🧑 Tạo khách thuê demo (mật khẩu: tenant123)...");
    const tenantPasswordHash = await bcrypt.hash("tenant123", 12);
    const [tenantUserA, tenantUserB] = await Promise.all([
        prisma.user.create({
            data: {
                username: "nguyenvana",
                passwordHash: tenantPasswordHash,
                name: "Nguyễn Văn A",
                role: "TENANT",
            },
        }),
        prisma.user.create({
            data: {
                username: "tranthib",
                passwordHash: tenantPasswordHash,
                name: "Trần Thị B",
                role: "TENANT",
            },
        }),
    ]);

    const [tenantA, tenantB] = await Promise.all([
        prisma.tenant.create({
            data: {
                userId: tenantUserA.id,
                fullName: "Nguyễn Văn A",
                phone: "0901234567",
                idCard: "001234567890",
            },
        }),
        prisma.tenant.create({
            data: {
                userId: tenantUserB.id,
                fullName: "Trần Thị B",
                phone: "0907654321",
                idCard: "001987654321",
            },
        }),
    ]);

    const room102 = await prisma.room.findUniqueOrThrow({
        where: { number: "102" },
    });
    const room201 = await prisma.room.findUniqueOrThrow({
        where: { number: "201" },
    });

    console.log("📄 Tạo hợp đồng thuê cho phòng 102 & 201...");
    await Promise.all([
        prisma.lease.create({
            data: {
                roomId: room102.id,
                tenantId: tenantA.id,
                startDate: new Date(Date.UTC(2026, 0, 15)),
                peopleCount: 1,
                motorcycleCount: 1,
                deposit: 3000000,
            },
        }),
        prisma.lease.create({
            data: {
                roomId: room201.id,
                tenantId: tenantB.id,
                startDate: new Date(Date.UTC(2026, 1, 1)),
                peopleCount: 1,
                motorcycleCount: 1,
                deposit: 3000000,
            },
        }),
    ]);

    await prisma.room.update({
        where: { id: room102.id },
        data: { status: "OCCUPIED" },
    });
    await prisma.room.update({
        where: { id: room201.id },
        data: { status: "OCCUPIED" },
    });

    console.log("🗓️ Tạo kỳ thanh toán 2026-08...");
    const period = await prisma.billingPeriod.create({
        data: {
            code: "2026-08",
            month: 8,
            year: 2026,
            startDate: new Date(Date.UTC(2026, 7, 1)),
            endDate: new Date(Date.UTC(2026, 7, 31, 23, 59, 59)),
            dueDate: new Date(Date.UTC(2026, 8, 5)),
        },
    });

    console.log("🔌 Tạo chỉ số điện/nước...");
    await prisma.meterReading.createMany({
        data: [
            {
                roomId: room102.id,
                billingPeriodId: period.id,
                electricityOld: 1000,
                electricityNew: 1120,
                waterOld: 50,
                waterNew: 54,
                peopleCount: 1,
                motorcycleCount: 1,
            },
            {
                roomId: room201.id,
                billingPeriodId: period.id,
                electricityOld: 800,
                electricityNew: 950,
                waterOld: 40,
                waterNew: 45,
                peopleCount: 1,
                motorcycleCount: 1,
            },
        ],
    });

    console.log("🧾 Tạo hoá đơn mẫu...");
    await createDemoInvoice({
        code: "HD-2608-102",
        roomId: room102.id,
        tenantId: tenantA.id,
        billingPeriodId: period.id,
        dueDate: period.dueDate,
        lines: [
            { feeType: "RENT", description: "Tiền phòng", quantity: 1, unitPrice: 3000000 },
            { feeType: "ELECTRICITY", description: "Tiền điện (120 kWh)", quantity: 120, unitPrice: 3500 },
            { feeType: "WATER", description: "Tiền nước (4 m³)", quantity: 4, unitPrice: 25000 },
            { feeType: "MOTORCYCLE", description: "Gửi xe máy (1 xe)", quantity: 1, unitPrice: 100000 },
            { feeType: "CLEANING", description: "Phí vệ sinh", quantity: 1, unitPrice: 30000 },
            { feeType: "INTERNET", description: "Internet", quantity: 1, unitPrice: 100000 },
            { feeType: "ELEVATOR", description: "Thang máy", quantity: 1, unitPrice: 50000 },
        ],
    });
    await createDemoInvoice({
        code: "HD-2608-201",
        roomId: room201.id,
        tenantId: tenantB.id,
        billingPeriodId: period.id,
        dueDate: period.dueDate,
        lines: [
            { feeType: "RENT", description: "Tiền phòng", quantity: 1, unitPrice: 3000000 },
            { feeType: "ELECTRICITY", description: "Tiền điện (150 kWh)", quantity: 150, unitPrice: 3500 },
            { feeType: "WATER", description: "Tiền nước (5 m³)", quantity: 5, unitPrice: 25000 },
            { feeType: "MOTORCYCLE", description: "Gửi xe máy (1 xe)", quantity: 1, unitPrice: 100000 },
            { feeType: "CLEANING", description: "Phí vệ sinh", quantity: 1, unitPrice: 30000 },
            { feeType: "INTERNET", description: "Internet", quantity: 1, unitPrice: 100000 },
            { feeType: "ELEVATOR", description: "Thang máy", quantity: 1, unitPrice: 50000 },
        ],
    });

    console.log("🏦 Tạo tài khoản ngân hàng nhận tiền (MB)...");
    await prisma.bankAccount.create({
        data: {
            bankName: "Ngân hàng TMCP Quân đội (MB)",
            bankCode: "MB",
            accountNumber: "1234567890",
            accountName: "NGUYEN VAN CHU",
            isActive: true,
        },
    });

    console.log("💸 Tạo giao dịch chuyển khoản mẫu...");
    await prisma.transferRecord.create({
        data: {
            externalId: "SEPA-DEMO-001",
            amount: 3800000,
            content: "HD-2608-102",
            sourceAccount: "0912345678",
            transferAt: new Date(Date.UTC(2026, 8, 1, 9, 30)),
            status: "REVIEW",
            source: "MANUAL",
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
