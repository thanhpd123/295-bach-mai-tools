import { z } from "zod";

/**
 * Schema validation cho các endpoint thanh toán.
 * Zod vừa validate, vừa cho ra kiểu TypeScript (`z.infer`).
 */

export const paymentStatusEnum = z.enum([
    "PENDING",
    "PAID",
    "REFUNDED",
    "CANCELLED",
]);

export const paymentMethodEnum = z.enum([
    "CASH",
    "BANK_TRANSFER",
    "MOMO",
    "ZALOPAY",
]);

/** Một dòng dịch vụ trong phiếu thanh toán */
export const paymentItemSchema = z.object({
    serviceId: z.string().min(1, "Thiếu mã dịch vụ"),
    quantity: z.coerce.number().int().positive("Số lượng phải > 0"),
    unitPrice: z.coerce.number().nonnegative("Đơn giá không âm"),
});

/** Body khi tạo mới phiếu thanh toán */
export const createPaymentSchema = z.object({
    patientId: z.string().min(1, "Thiếu bệnh nhân"),
    method: paymentMethodEnum.default("CASH"),
    status: paymentStatusEnum.default("PENDING"),
    note: z.string().max(500).optional(),
    items: z.array(paymentItemSchema).min(1, "Cần ít nhất 1 dịch vụ"),
});

/** Body khi cập nhật phiếu thanh toán (toàn bộ field là optional) */
export const updatePaymentSchema = createPaymentSchema.partial();

/** Query string cho danh sách (phân trang + lọc + tìm kiếm) */
export const paymentQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: paymentStatusEnum.optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
