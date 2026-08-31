import { createHmac, timingSafeEqual } from "crypto";
import { DomainError } from "@/lib/api/errors";
import { reconcileTransfer } from "@/lib/services/billing.service";

/**
 * Xử lý webhook SePay (đối soát chuyển khoản tự động).
 *
 * SePay gửi POST với body là mảng giao dịch. Xác thực theo một trong hai
 * cách (tuỳ cấu hình webhook trên SePay):
 *  1. Header `X-Signature` = HMAC-SHA256(rawBody, SEPA_WEBHOOK_SECRET) (hex).
 *  2. Header `Authorization: Apikey <SEPA_WEBHOOK_SECRET>`.
 */

interface SepayTransaction {
    id?: number | string;
    content?: string;
    transferAmount?: number | string;
    accountNumber?: string;
    transactionDate?: string;
    transferType?: string; // "in" = tiền vào, "out" = tiền ra
}

export interface WebhookProcessResult {
    processed: number;
    matched: number;
    unmatched: number;
    failed: number;
}

function constantTimeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
}

/** Xác minh chữ ký webhook SePay (hỗ trợ cả HMAC lẫn Apikey). */
export function verifySepaySignature(rawBody: string, headers: Headers): boolean {
    const secret = process.env.SEPA_WEBHOOK_SECRET;
    if (!secret) {
        // Chưa cấu hình secret: chỉ chấp nhận trong môi trường dev.
        return process.env.NODE_ENV !== "production";
    }

    const signature = headers.get("x-signature");
    if (signature) {
        const expected = createHmac("sha256", secret)
            .update(rawBody, "utf8")
            .digest("hex");
        return constantTimeEqual(expected, signature.trim());
    }

    const authorization = headers.get("authorization") ?? "";
    const match = authorization.match(/^(?:Apikey|Bearer)\s+(.+)$/i);
    if (match) {
        return constantTimeEqual(secret, match[1].trim());
    }

    return false;
}

export async function processSepayWebhook(
    rawBody: string,
    headers: Headers,
): Promise<WebhookProcessResult> {
    if (!verifySepaySignature(rawBody, headers)) {
        throw new DomainError(401, "Chữ ký webhook không hợp lệ");
    }

    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        throw new DomainError(422, "Định dạng webhook không hợp lệ");
    }

    if (!Array.isArray(payload)) {
        throw new DomainError(422, "Định dạng webhook không hợp lệ");
    }

    const results: WebhookProcessResult = {
        processed: 0,
        matched: 0,
        unmatched: 0,
        failed: 0,
    };

    for (const item of payload as SepayTransaction[]) {
        if (!item.id || item.transferAmount === undefined) continue;

        // Chỉ đối soát giao dịch TIỀN VÀO; bỏ qua rút tiền/chuyển đi ("out").
        if ((item.transferType ?? "in") !== "in") continue;

        const amount = Number(item.transferAmount);
        if (!Number.isFinite(amount) || amount <= 0) continue;

        try {
            const record = await reconcileTransfer({
                externalId: String(item.id),
                amount,
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

    // Có giao dịch lỗi → báo lỗi để SePay gửi lại cả batch.
    // Idempotency theo externalId đảm bảo giao dịch đã xử lý không bị lặp.
    if (results.failed > 0) {
        throw new DomainError(
            502,
            "Một số giao dịch xử lý thất bại, cần gửi lại",
        );
    }

    return results;
}
