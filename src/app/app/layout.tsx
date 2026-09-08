import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { LogoMark } from "@/components/ui/logo-mark";
import { siteConfig } from "@/config/site";

/**
 * Layout cho cổng người thuê (mobile-first).
 * Chỉ giữ header tĩnh; thanh điều hướng dưới nằm trong TenantPortal (client)
 * để chuyển tab tức thì, không tải lại trang.
 */
export default function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080b1b]/70 backdrop-blur-2xl">
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
                    <Link href="/app" className="flex min-w-0 items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center">
                            <LogoMark className="size-8" />
                        </div>
                        <span className="truncate font-semibold text-white">{siteConfig.name}</span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                        <LogoutButton />
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 sm:pb-10 sm:pt-6">
                {children}
            </main>
        </div>
    );
}
