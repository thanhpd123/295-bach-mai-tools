import { z } from "zod";

/** Tạo hợp đồng thuê (người thuê chuyển vào phòng) */
export const createLeaseSchema = z.object({
    roomId: z.string().min(1, "Thiếu phòng"),
    tenantId: z.string().min(1, "Thiếu người thuê"),
    startDate: z.coerce.date(),
    peopleCount: z.coerce.number().int().min(1, "Số người ≥ 1").default(1),
    motorcycleCount: z.coerce
        .number()
        .int()
        .nonnegative()
        .default(0),
    deposit: z.coerce.number().nonnegative().default(0),
});

/** Kết thúc hợp đồng (chuyển đi) */
export const endLeaseSchema = z.object({
    endDate: z.coerce.date(),
    finalElectricity: z.coerce.number().int().nonnegative().optional(),
    finalWater: z.coerce.number().int().nonnegative().optional(),
});

export const leaseQuerySchema = z.object({
    roomId: z.string().optional(),
    tenantId: z.string().optional(),
    status: z.enum(["ACTIVE", "ENDED"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type EndLeaseInput = z.infer<typeof endLeaseSchema>;
export type LeaseQuery = z.infer<typeof leaseQuerySchema>;
