import { cookies } from "next/headers";
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    signSessionToken,
    verifySessionToken,
    type SessionPayload,
} from "./jwt";

/**
 * Quản lý phiên đăng nhập (cookie httpOnly) — chỉ chạy phía server.
 * Stateless: token chứa sẵn userId/role, không cần tra DB mỗi request.
 */

export async function createSession(payload: SessionPayload): Promise<void> {
    const token = await signSessionToken(payload);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}
