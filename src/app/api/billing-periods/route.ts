import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import {
    createBillingPeriod,
    listBillingPeriods,
} from "@/lib/services/billing.service";
import { createBillingPeriodSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/billing-periods → danh sách kỳ; POST → tạo kỳ mới */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireAdmin();
        return ok(await listBillingPeriods());
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = createBillingPeriodSchema.parse(body);
        const period = await createBillingPeriod(input);
        await writeAudit({
            actorId: admin.id,
            action: "BILLING_PERIOD_CREATE",
            entityType: "BillingPeriod",
            entityId: period.id,
            metadata: input,
            ...extractClientInfo(request),
        });
        return ok(period, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
