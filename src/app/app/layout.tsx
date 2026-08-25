import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "@/components/auth/logout-button";
import { siteConfig } from "@/config/site";

/** Layout cho cổng người thuê. */
export default async function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            {siteConfig.shortName}
                        </div>
                        <span className="font-semibold">{siteConfig.name}</span>
                    </div>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link href="/app" className="text-slate-600 hover:text-slate-900">
                            Trang chủ
                        </Link>
                        <Link
                            href="/app/invoices"
                            className="text-slate-600 hover:text-slate-900"
                        >
                            Hoá đơn
                        </Link>
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
                {user && (
                    <div className="mb-4 text-sm text-slate-500">
                        Xin chào, <strong className="text-slate-700">{user.name}</strong>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
