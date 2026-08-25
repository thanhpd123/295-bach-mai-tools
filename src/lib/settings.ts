import { db } from "@/lib/db";

/**
 * Cài đặt hệ thống dạng key-value (bảng Setting).
 * Dùng cho đơn giá điện/nước/xe, phí cố định, ngày hạn mặc định...
 */

export interface FeeSettings {
    electricityUnitPrice: number; // đơn giá điện (VND/kWh)
    waterUnitPrice: number; // đơn giá nước (VND/m3)
    motorcycleUnitPrice: number; // giá gửi xe (VND/xe)
    cleaningFee: number; // phí vệ sinh (VND)
    internetFee: number; // phí internet (VND)
    elevatorFee: number; // phí thang máy (VND)
    dueDay: number; // ngày hạn thanh toán của tháng (1-28)
}

export const DEFAULT_FEES: FeeSettings = {
    electricityUnitPrice: 3500,
    waterUnitPrice: 25000,
    motorcycleUnitPrice: 100000,
    cleaningFee: 30000,
    internetFee: 100000,
    elevatorFee: 50000,
    dueDay: 5,
};

const FEES_KEY = "fees";

export async function getFeeSettings(): Promise<FeeSettings> {
    const row = await db.setting.findUnique({ where: { key: FEES_KEY } });
    if (!row) return { ...DEFAULT_FEES };
    const stored = row.value as unknown as Partial<FeeSettings>;
    return { ...DEFAULT_FEES, ...stored };
}

export async function saveFeeSettings(
    input: Partial<FeeSettings>,
): Promise<FeeSettings> {
    const merged = { ...(await getFeeSettings()), ...input };
    await db.setting.upsert({
        where: { key: FEES_KEY },
        create: { key: FEES_KEY, value: merged as unknown as object },
        update: { value: merged as unknown as object },
    });
    return merged;
}
