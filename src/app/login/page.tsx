import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark } from "@/components/ui/logo-mark";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: "Đăng nhập",
};

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center">
                        <LogoMark className="size-14" />
                    </div>
                    <h1 className="text-gradient text-3xl font-bold tracking-tight">
                        {siteConfig.name}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Đăng nhập để xem phòng và thanh toán hoá đơn
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
