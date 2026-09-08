import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantDtoByUserId } from "@/lib/services/tenant.service";
import { LogoutButton } from "@/components/auth/logout-button";
import { BottomNav } from "@/components/tenant/bottom-nav";
import { LogoMark } from "@/components/ui/logo-mark";
import { siteConfig } from "@/config/site";

/** Layout cho cổng người thuê (mobile-first). */
export default async function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    const tenant = user ? await getTenantDtoByUserId(user.id) : null;

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
                        {tenant?.activeRoom && (
                            <span className="hidden text-sm text-slate-400 sm:inline">
                                Phòng {tenant.activeRoom}
                            </span>
                        )}
                        <LogoutButton />
                    </div>
                </div>
            </header>
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 sm:pb-10 sm:pt-6">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
