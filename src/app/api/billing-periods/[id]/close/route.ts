import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { closeBillingPeriod } from "@/lib/services/billing.service";

/** POST /api/billing-periods/:id/close → chốt kỳ */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
    try {
        await requireAdmin();
        const { id } = await context.params;
        return ok(await closeBillingPeriod(id));
    } catch (error) {
        return handleApiError(error);
    }
}
