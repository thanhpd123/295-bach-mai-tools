import { ok } from "@/lib/api/response";

/** Endpoint kiểm tra sức khoẻ hệ thống (dùng cho health-check). */
export const dynamic = "force-dynamic";

export async function GET() {
    return ok({
        status: "ok",
        service: "manager-payment-tools",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}
