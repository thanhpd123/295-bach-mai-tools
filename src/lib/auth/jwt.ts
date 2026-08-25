import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/generated/prisma/enums";

/**
 * JWT thuần tuý (không phụ thuộc next/headers) — chạy được cả trên Edge (proxy).
 * Chỉ chứa tối thiểu dữ liệu: userId, role, name (KHÔNG chứa email/phone/mật khẩu).
 */

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 ngày (giây)

export interface SessionPayload {
    sub: string; // userId
    role: UserRole;
    name: string;
}

const DEV_SECRET = "dev-only-secret-do-not-use-in-production";

function getSecret(): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("AUTH_SECRET chưa được cấu hình trong production");
        }
        return DEV_SECRET;
    }
    return secret;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ role: payload.role, name: payload.name })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(new TextEncoder().encode(getSecret()));
}

export async function verifySessionToken(
    token: string | undefined | null,
): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(getSecret()),
            { algorithms: ["HS256"] },
        );
        if (!payload.sub) return null;
        return {
            sub: payload.sub,
            role: payload.role as UserRole,
            name: (payload.name as string | undefined) ?? "",
        };
    } catch {
        return null;
    }
}
