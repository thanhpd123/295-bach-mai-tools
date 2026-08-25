import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { createPayment, listPayments } from "@/lib/services/payment.service";
import {
    createPaymentSchema,
    paymentQuerySchema,
} from "@/lib/validation/payment";
import type { NextRequest } from "next/server";

/**
 *  GET  /api/payments          → danh sách (phân trang + lọc + tìm kiếm)
 *  POST /api/payments          → tạo mới phiếu thanh toán
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const query = paymentQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listPayments(query));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = createPaymentSchema.parse(body);
        return ok(await createPayment(input), { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
