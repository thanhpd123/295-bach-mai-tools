import { z } from "zod";

/** Tạo kỳ thanh toán (theo tháng) */
export const createBillingPeriodSchema = z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
});

/** Upsert hàng loạt chỉ số công tơ cho một kỳ */
export const meterReadingItemSchema = z.object({
    roomId: z.string().min(1, "Thiếu phòng"),
    electricityOld: z.coerce.number().int().nonnegative().optional(),
    electricityNew: z.coerce.number().int().nonnegative("Số điện mới ≥ 0"),
    waterOld: z.coerce.number().int().nonnegative().optional(),
    waterNew: z.coerce.number().int().nonnegative("Số nước mới ≥ 0"),
    peopleCount: z.coerce.number().int().min(1).optional(),
    motorcycleCount: z.coerce.number().int().nonnegative().optional(),
});

export const upsertMeterReadingsSchema = z.object({
    billingPeriodId: z.string().min(1, "Thiếu kỳ thanh toán"),
    readings: z.array(meterReadingItemSchema).min(1, "Cần ít nhất 1 bản ghi"),
});

/** Tạo hoá đơn hàng loạt cho một kỳ */
export const generateInvoicesSchema = z.object({
    billingPeriodId: z.string().min(1, "Thiếu kỳ thanh toán"),
    roomIds: z.array(z.string()).optional(),
});

/** Chuyển trạng thái hoá đơn (gửi/huỷ) */
export const updateInvoiceSchema = z.object({
    status: z.enum(["PENDING", "CANCELLED"]).optional(),
    note: z.string().trim().max(500).optional(),
});

/** Xác nhận thanh toán thủ công */
export const markPaidSchema = z.object({
    amount: z.coerce.number().positive("Số tiền > 0").optional(),
    method: z.enum(["BANK_TRANSFER", "CASH"]).default("BANK_TRANSFER"),
    note: z.string().trim().max(500).optional(),
});

/** Query danh sách hoá đơn */
export const invoiceQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: z
        .enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"])
        .optional(),
    billingPeriodId: z.string().optional(),
    roomId: z.string().optional(),
});

/** Query danh sách giao dịch chuyển khoản */
export const transferQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(["MATCHED", "UNMATCHED", "DUPLICATE", "REVIEW"]).optional(),
});

/** Cài đặt tài khoản ngân hàng */
export const bankAccountSchema = z.object({
    bankName: z.string().trim().min(2).max(100),
    bankCode: z.string().trim().min(3).max(20),
    accountNumber: z.string().trim().min(5).max(30),
    accountName: z.string().trim().min(2).max(200),
    isActive: z.boolean().default(false),
});

/** Cài đặt đơn giá */
export const feeSettingsSchema = z.object({
    electricityUnitPrice: z.coerce.number().nonnegative(),
    waterUnitPrice: z.coerce.number().nonnegative(),
    motorcycleUnitPrice: z.coerce.number().nonnegative(),
    cleaningFee: z.coerce.number().nonnegative(),
    internetFee: z.coerce.number().nonnegative(),
    elevatorFee: z.coerce.number().nonnegative(),
    dueDay: z.coerce.number().int().min(1).max(28),
});

export type CreateBillingPeriodInput = z.infer<
    typeof createBillingPeriodSchema
>;
export type UpsertMeterReadingsInput = z.infer<
    typeof upsertMeterReadingsSchema
>;
export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;
export type TransferQuery = z.infer<typeof transferQuerySchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type FeeSettingsInput = z.infer<typeof feeSettingsSchema>;
