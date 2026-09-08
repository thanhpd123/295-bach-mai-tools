import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export const metadata: Metadata = { title: "Đổi mật khẩu" };

export default function ChangePasswordPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Đổi mật khẩu</h1>
            <ChangePasswordForm />
        </div>
    );
}
