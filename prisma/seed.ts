import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Seed script — tạo dữ liệu mẫu để phát triển.
 * Chạy bằng: npm run db:seed
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🧹 Xoá dữ liệu cũ...");
    await prisma.paymentItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.patient.deleteMany();

    console.log("📦 Tạo dịch vụ...");
    const [kham, xetNghiem, sieuAm, xquang] = await Promise.all([
        prisma.service.create({
            data: { code: "DV-001", name: "Khám bệnh", unit: "lần", price: 200000 },
        }),
        prisma.service.create({
            data: { code: "DV-002", name: "Xét nghiệm máu", unit: "lần", price: 150000 },
        }),
        prisma.service.create({
            data: { code: "DV-003", name: "Siêu âm", unit: "lần", price: 300000 },
        }),
        prisma.service.create({
            data: { code: "DV-004", name: "Chụp X-quang", unit: "lần", price: 250000 },
        }),
    ]);

    console.log("👤 Tạo bệnh nhân...");
    const [bnA, bnB, bnC] = await Promise.all([
        prisma.patient.create({
            data: { code: "BN-001", name: "Nguyễn Văn A", phone: "0900000001", dob: new Date("1990-01-15") },
        }),
        prisma.patient.create({
            data: { code: "BN-002", name: "Trần Thị B", phone: "0900000002", dob: new Date("1985-06-20") },
        }),
        prisma.patient.create({
            data: { code: "BN-003", name: "Lê Văn C", phone: "0900000003", dob: new Date("1995-11-02") },
        }),
    ]);

    console.log("💳 Tạo phiếu thanh toán...");
    await prisma.payment.create({
        data: {
            code: "PT-2026-00001",
            patientId: bnA.id,
            status: "PAID",
            method: "CASH",
            totalAmount: 350000,
            paidAt: new Date(),
            items: {
                create: [
                    { serviceId: kham.id, quantity: 1, unitPrice: 200000, total: 200000 },
                    { serviceId: xetNghiem.id, quantity: 1, unitPrice: 150000, total: 150000 },
                ],
            },
        },
    });

    await prisma.payment.create({
        data: {
            code: "PT-2026-00002",
            patientId: bnB.id,
            status: "PAID",
            method: "BANK_TRANSFER",
            totalAmount: 550000,
            paidAt: new Date(),
            items: {
                create: [
                    { serviceId: sieuAm.id, quantity: 1, unitPrice: 300000, total: 300000 },
                    { serviceId: xquang.id, quantity: 1, unitPrice: 250000, total: 250000 },
                ],
            },
        },
    });

    await prisma.payment.create({
        data: {
            code: "PT-2026-00003",
            patientId: bnC.id,
            status: "PENDING",
            method: "CASH",
            totalAmount: 200000,
            note: "Hẹn thanh toán sau",
            items: {
                create: [{ serviceId: kham.id, quantity: 1, unitPrice: 200000, total: 200000 }],
            },
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
