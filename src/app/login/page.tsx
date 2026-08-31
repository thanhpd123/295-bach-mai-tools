import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark } from "@/components/ui/logo-mark";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Đăng nhập",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center">
                        <LogoMark className="size-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {siteConfig.name}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Đăng nhập để xem phòng và thanh toán hoá đơn
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
