import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

/**
 * Proxy (Next.js 16 thay thế middleware) — bảo vệ route theo vai trò.
 * Chỉ parse JWT (Edge-safe), KHÔNG gọi database.
 *
 * Luồng:
 *  - /dashboard/*  : chỉ ADMIN
 *  - /app/*        : chỉ TENANT
 *  - /login        : chuyển hướng theo vai trò nếu đã đăng nhập
 */

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);

    if (pathname.startsWith("/login")) {
        if (session) {
            const home = session.role === "ADMIN" ? "/dashboard" : "/app";
            return NextResponse.redirect(new URL(home, request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/app", request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/app")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (session.role === "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/dashboard/:path*", "/app/:path*"],
};
