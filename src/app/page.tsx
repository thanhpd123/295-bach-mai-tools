import Link from "next/link";
import { ArrowRight, Receipt, ShieldCheck, TrendingUp } from "lucide-react";
import { siteConfig } from "@/config/site";

const features = [
    {
        icon: Receipt,
        title: "Quản lý phiếu thu",
        description:
            "Tạo, theo dõi và tra cứu phiếu thanh toán theo bệnh nhân, dịch vụ.",
    },
    {
        icon: TrendingUp,
        title: "Báo cáo doanh thu",
        description:
            "Tổng hợp doanh thu theo ngày, theo dịch vụ và phương thức thanh toán.",
    },
    {
        icon: ShieldCheck,
        title: "An toàn & dễ mở rộng",
        description:
            "Kiến trúc Next.js + Prisma, sẵn sàng deploy lên Vercel và scale dần.",
    },
];

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="border-b border-slate-200">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            295
                        </div>
                        <span className="font-semibold">{siteConfig.name}</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Vào Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
                {/* Hero */}
                <section className="flex flex-col items-center py-20 text-center">
                    <span className="mb-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        Next.js · TypeScript · Prisma · Vercel
                    </span>
                    <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Quản lý thanh toán cho phòng khám{" "}
                        <span className="text-blue-600">295 Bạch Mai</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-slate-500">
                        {siteConfig.description}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Bắt đầu ngay <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="/dashboard/payments"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            Xem danh sách thanh toán
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section className="grid gap-6 pb-20 sm:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 p-6"
                        >
                            <feature.icon className="mb-3 size-6 text-blue-600" />
                            <h2 className="font-semibold text-slate-900">{feature.title}</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </section>
            </main>

            <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
                {siteConfig.name} · {new Date().getFullYear()}
            </footer>
        </div>
    );
}
