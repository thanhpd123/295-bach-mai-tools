import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import {
    deletePayment,
    getPaymentById,
    updatePayment,
} from "@/lib/services/payment.service";
import { updatePaymentSchema } from "@/lib/validation/payment";
import type { NextRequest } from "next/server";

/**
 *  GET    /api/payments/:id   → chi tiết
 *  PATCH  /api/payments/:id   → cập nhật
 *  DELETE /api/payments/:id   → xoá
 */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const payment = await getPaymentById(id);
        if (!payment) return fail("Không tìm thấy phiếu thanh toán", 404);
        return ok(payment);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const input = updatePaymentSchema.parse(body);
        return ok(await updatePayment(id, input));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        await deletePayment(id);
        return ok({ deleted: true });
    } catch (error) {
        return handleApiError(error);
    }
}
