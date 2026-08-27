import { z } from "zod";

export const loginSchema = z.object({
    account: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập tên đăng nhập hoặc số điện thoại")
        .max(200),
    password: z.string().min(1, "Vui lòng nhập mật khẩu").max(200),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
        .string()
        .min(8, "Mật khẩu mới tối thiểu 8 ký tự")
        .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
