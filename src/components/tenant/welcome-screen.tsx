"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, LogIn, QrCode, Smartphone } from "lucide-react";

const COOKIE = "qlpt-onboarded";

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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                        QLPT
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-slate-900">
                        Chào mừng bạn!
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Chỉ cần 3 bước để bắt đầu sử dụng.
                    </p>
                </div>

                <ol className="mt-6 space-y-4">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                <step.icon className="size-5" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">
                                    {i + 1}. {step.title}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {step.desc}
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>

                <button
                    type="button"
                    onClick={finish}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
                >
                    <CheckCircle2 className="size-5" />
                    Bắt đầu sử dụng
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                    Bạn có thể xem lại hướng dẫn trong mục Cá nhân → Hướng dẫn
                    sử dụng.
                </p>
            </div>
        </div>
    );
}
