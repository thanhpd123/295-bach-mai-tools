import { createHmac, timingSafeEqual } from "crypto";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { reconcileTransfer } from "@/lib/services/billing.service";
import type { NextRequest } from "next/server";

/**
 * Webhook SePay — nhận giao dịch chuyển khoản, đối soát tự động.
 * Bảo mật:
 *  - Xác minh chữ ký HMAC-SHA256 (header `X-Signature`) bằng SEPA_WEBHOOK_SECRET.
 *  - Chống trùng theo `id` giao dịch (externalId unique).
 *
 * Cấu hình: SEPA_WEBHOOK_SECRET = token webhook đặt tại SePay.
 */
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.SEPA_WEBHOOK_SECRET;
    if (!secret) {
        // Chưa cấu hình secret: chỉ chấp nhận trong môi trường dev.
        if (process.env.NODE_ENV === "production") return false;
        return true;
    }
    if (!signature) return false;

    const expected = createHmac("sha256", secret).update(rawBody).digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length) return false;
    return timingSafeEqual(expected, received);
}

interface SepayTransaction {
    id?: number | string;
    content?: string;
    transferAmount?: number;
    accountNumber?: string;
    transactionDate?: string;
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get("x-signature");

        if (!verifySignature(rawBody, signature)) {
            return fail("Chữ ký không hợp lệ", 401);
        }

        const payload = JSON.parse(rawBody) as SepayTransaction[];
        if (!Array.isArray(payload)) {
            return fail("Định dạng webhook không hợp lệ", 422);
        }

        const results = { processed: 0, matched: 0, unmatched: 0, failed: 0 };

        for (const item of payload) {
            if (!item.id || !item.transferAmount) continue;
            try {
                const record = await reconcileTransfer({
                    externalId: String(item.id),
                    amount: item.transferAmount,
                    content: item.content,
                    sourceAccount: item.accountNumber,
                    transferAt: item.transactionDate
                        ? new Date(item.transactionDate)
                        : new Date(),
                });
                results.processed += 1;
                if (record.status === "MATCHED") results.matched += 1;
                if (record.status === "UNMATCHED") results.unmatched += 1;
            } catch {
                results.failed += 1;
            }
        }

        return ok(results);
    } catch (error) {
        return handleApiError(error);
    }
}
