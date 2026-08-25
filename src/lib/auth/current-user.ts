import { getSession } from "./session";
import { AuthError } from "./errors";
import type { SessionUser } from "@/types";

/** Lấy người dùng hiện tại (hoặc null nếu chưa đăng nhập). */
export async function getCurrentUser(): Promise<SessionUser | null> {
    const session = await getSession();
    if (!session) return null;
    return { id: session.sub, role: session.role, name: session.name };
}

/** Bắt buộc đã đăng nhập (mọi vai trò). Ném AuthError nếu chưa. */
export async function requireUser(): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user) throw new AuthError(401, "Vui lòng đăng nhập");
    return user;
}

/** Bắt buộc vai trò ADMIN. Ném AuthError nếu chưa đăng nhập hoặc không đủ quyền. */
export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireUser();
    if (user.role !== "ADMIN") {
        throw new AuthError(403, "Không có quyền truy cập");
    }
    return user;
}
