import { z } from "zod";

/** Tạo người thuê + tài khoản đăng nhập */
export const createTenantSchema = z.object({
    fullName: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(200),
    phone: z.string().trim().max(20).optional(),
    idCard: z.string().trim().max(30).optional(),
    note: z.string().trim().max(500).optional(),
    email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(200),
});

export const updateTenantSchema = z.object({
    fullName: z.string().trim().min(2).max(200).optional(),
    phone: z.string().trim().max(20).optional(),
    idCard: z.string().trim().max(30).optional(),
    note: z.string().trim().max(500).optional(),
    isActive: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(200),
});

export const tenantQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TenantQuery = z.infer<typeof tenantQuerySchema>;
