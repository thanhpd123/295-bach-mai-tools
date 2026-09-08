import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "@/components/auth/logout-button";

/** Thanh header cố định phía trên của dashboard */
export async function Header() {
    const user = await getCurrentUser();

    const initial = (user?.name ?? "?").charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080b1b]/70 px-4 pl-16 backdrop-blur-2xl lg:pl-6">
            <div className="hidden text-sm text-slate-400 sm:block">
                <span className="text-slate-500">Chủ Trọ</span>
                <span className="mx-2 text-slate-600">/</span>
                Quản lý phòng trọ
            </div>
            <div className="flex items-center gap-3">
                {user && (
                    <span className="hidden text-sm text-slate-300 md:inline">
                        Xin chào,{" "}
                        <strong className="font-semibold text-white">
                            {user.name}
                        </strong>
                    </span>
                )}
                <div className="avatar-ring">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#161a32] text-xs font-semibold text-cyan-200">
                        {initial}
                    </div>
                </div>
                <LogoutButton />
            </div>
        </header>
    );
}
