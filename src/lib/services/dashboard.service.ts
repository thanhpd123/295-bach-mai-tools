import { db } from "@/lib/db";
import { decimalToNumber, serializeDate } from "@/lib/serializers";
import { getActiveBankAccount } from "@/lib/services/bank.service";
import {
    getOpenBillingPeriod,
    serializeInvoice,
    syncOverdueInvoices,
    type RawInvoice,
} from "@/lib/services/billing.service";
import type { DashboardStatsDto, TenantHomeDto } from "@/types";

// ------------------------------------------------------------
// Dashboard (admin)
// ------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStatsDto> {
    await syncOverdueInvoices();

    const [totalRooms, occupiedRooms, vacantRooms, maintenanceRooms] =
        await Promise.all([
            db.room.count({ where: { isActive: true } }),
            db.room.count({ where: { status: "OCCUPIED" } }),
            db.room.count({ where: { status: "VACANT" } }),
            db.room.count({ where: { status: "MAINTENANCE" } }),
        ]);

    const openPeriod = await getOpenBillingPeriod();

    const [
        pendingInvoices,
        overdueInvoices,
        paidAgg,
        outstandingAgg,
    ] = await Promise.all([
        db.invoice.count({ where: { status: "PENDING" } }),
        db.invoice.count({ where: { status: "OVERDUE" } }),
        db.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: "PAID", billingPeriodId: openPeriod?.id },
        }),
        db.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ["PENDING", "OVERDUE"] },
                billingPeriodId: openPeriod?.id,
            },
        }),
    ]);

    const paidInvoices = await db.invoice.findMany({
        where: { status: "PAID", billingPeriodId: openPeriod?.id },
        select: { paidAmount: true },
    });

    return {
        totalRooms,
        occupiedRooms,
        vacantRooms,
        maintenanceRooms,
        pendingInvoices,
        overdueInvoices,
        monthRevenue: decimalToNumber(paidAgg._sum.totalAmount ?? 0),
        monthCollected: paidInvoices.reduce(
            (sum, i) => sum + decimalToNumber(i.paidAmount),
            0,
        ),
        monthOutstanding: decimalToNumber(outstandingAgg._sum.totalAmount ?? 0),
        currentPeriodCode: openPeriod?.code ?? null,
        currentPeriodDueDate: openPeriod?.dueDate ?? null,
    };
}

// ------------------------------------------------------------
// Tenant portal
// ------------------------------------------------------------

/** Trang chủ người thuê: phòng, chỉ số, hoá đơn kỳ hiện tại, tài khoản nhận tiền. */
export async function getTenantHome(tenantId: string): Promise<TenantHomeDto> {
    await syncOverdueInvoices();

    // Chạy song song các truy vấn độc lập để giảm độ trễ trên mobile.
    const [activeLease, openPeriod, bankAccount] = await Promise.all([
        db.lease.findFirst({
            where: { tenantId, status: "ACTIVE" },
            include: { room: true },
        }),
        db.billingPeriod.findFirst({
            where: { status: "OPEN" },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        }),
        getActiveBankAccount(),
    ]);

    if (!activeLease) {
        return {
            roomNumber: "—",
            floor: 0,
            invoice: null,
            meterReading: null,
            dueDate: null,
            bankAccount,
        };
    }

    const [invoice, meterReading] = await Promise.all([
        openPeriod
            ? db.invoice.findFirst({
                where: {
                    billingPeriodId: openPeriod.id,
                    tenantId,
                    status: { in: ["PENDING", "PAID", "OVERDUE"] },
                },
                include: {
                    room: true,
                    billingPeriod: true,
                    tenant: true,
                    items: true,
                },
            })
            : Promise.resolve(null),
        openPeriod
            ? db.meterReading.findUnique({
                where: {
                    roomId_billingPeriodId: {
                        roomId: activeLease.roomId,
                        billingPeriodId: openPeriod.id,
                    },
                },
                include: { room: true },
            })
            : Promise.resolve(null),
    ]);

    // Serialize trực tiếp từ bản ghi vừa truy vấn (không truy vấn lại DB).
    const serializedInvoice = invoice
        ? serializeInvoice(invoice as unknown as RawInvoice)
        : null;

    return {
        roomNumber: activeLease.room.number,
        floor: activeLease.room.floor,
        invoice: serializedInvoice,
        meterReading: meterReading
            ? {
                id: meterReading.id,
                roomId: meterReading.roomId,
                roomNumber: meterReading.room.number,
                billingPeriodId: meterReading.billingPeriodId,
                electricityOld: meterReading.electricityOld,
                electricityNew: meterReading.electricityNew,
                waterOld: meterReading.waterOld,
                waterNew: meterReading.waterNew,
                electricityUsage:
                    meterReading.electricityNew - meterReading.electricityOld,
                waterUsage: meterReading.waterNew - meterReading.waterOld,
                peopleCount: meterReading.peopleCount,
                motorcycleCount: meterReading.motorcycleCount,
            }
            : null,
        dueDate:
            openPeriod?.dueDate
                ? serializeDate(openPeriod.dueDate)
                : null,
        bankAccount,
    };
}
