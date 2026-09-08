"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, LogIn, QrCode, Smartphone } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";

const COOKIE = "chu-tro-onboarded";

const steps = [
    {
        icon: Smartphone,
        title: "Nhận tài khoản từ chủ nhà",
        desc: "Chủ nhà sẽ gửi cho bạn tên đăng nhập và mật khẩu để đăng nhập.",
    },
    {
        icon: LogIn,
        title: "Đăng nhập vào hệ thống",
        desc: "Mở ứng dụng, đăng nhập bằng tài khoản được cấp.",
    },
    {
        icon: QrCode,
        title: "Xem hoá đơn và thanh toán",
        desc: "Kiểm tra số tiền cần trả, quét mã QR hoặc chuyển khoản ghi đúng MÃ HOÁ ĐƠN.",
    },
];

/** Màn hình chào mừng hiện 1 lần cho người thuê mới. */
export function WelcomeScreen() {
    const router = useRouter();

    const finish = () => {
        document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        router.refresh();
    };

    return (
        <div className="flex min-h-[70vh] flex-col justify-center">
            <div className="glass rounded-2xl p-6">
                <div className="text-center">
                    <div className="mx-auto flex size-14 items-center justify-center">
                        <LogoMark className="size-14" />
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-white">
                        Chào mừng bạn!
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Chỉ cần 3 bước để bắt đầu sử dụng.
                    </p>
                </div>

                <ol className="mt-6 space-y-4">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                                <step.icon className="size-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-white">
                                    {i + 1}. {step.title}
                                </div>
                                <div className="text-sm text-slate-400">
                                    {step.desc}
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>

                <button
                    type="button"
                    onClick={finish}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-cyan-500 px-6 text-base font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.18)] transition-all hover:brightness-110"
                >
                    <CheckCircle2 className="size-5" />
                    Bắt đầu sử dụng
                </button>

                <p className="mt-3 text-center text-xs text-slate-500">
                    Bạn có thể xem lại hướng dẫn trong mục Cá nhân → Hướng dẫn
                    sử dụng.
                </p>
            </div>
        </div>
    );
}
