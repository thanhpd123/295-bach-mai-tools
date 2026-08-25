import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { processSepayWebhook } from "@/lib/services/sepay.service";
import type { NextRequest } from "next/server";

/**
 * Webhook SePay — trỏ từ SePay về: https://<domain>/hooks/sepay-payment
 * POST: nhận giao dịch chuyển khoản và đối soát tự động vào hoá đơn.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const result = await processSepayWebhook(rawBody, request.headers);
        return ok(result);
    } catch (error) {
        return handleApiError(error);
    }
}

/** GET dùng để kiểm tra kết nối webhook. */
export async function GET() {
    return ok({ status: "ok" });
}
