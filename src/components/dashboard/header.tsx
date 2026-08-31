import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "@/components/auth/logout-button";

/** Thanh header cố định phía trên của dashboard */
export async function Header() {
    const user = await getCurrentUser();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
            <div className="text-sm font-medium text-slate-500">
                Chủ Trọ · Quản lý phòng trọ
            </div>
            <div className="flex items-center gap-3">
                {user && (
                    <span className="text-sm text-slate-600">
                        Xin chào, <strong>{user.name}</strong>
                    </span>
                )}
                <LogoutButton />
            </div>
        </header>
    );
}
