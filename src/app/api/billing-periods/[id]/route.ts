import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import {
    closeBillingPeriod,
    getBillingPeriod,
} from "@/lib/services/billing.service";

/** GET /api/billing-periods/:id → chi tiết kỳ */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    try {
        await requireAdmin();
        const { id } = await context.params;
        const period = await getBillingPeriod(id);
        if (!period) return fail("Không tìm thấy kỳ thanh toán", 404);
        return ok(period);
    } catch (error) {
        return handleApiError(error);
    }
}
