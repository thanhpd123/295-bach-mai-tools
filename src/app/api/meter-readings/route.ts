import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import {
    getMeterReadingSuggestions,
    listMeterReadings,
    upsertMeterReadings,
} from "@/lib/services/billing.service";
import { upsertMeterReadingsSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/meter-readings?billingPeriodId=... → danh sách chỉ số;
 *  POST /api/meter-readings → upsert hàng loạt */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const billingPeriodId = request.nextUrl.searchParams.get("billingPeriodId");
        if (!billingPeriodId) {
            return fail("Thiếu tham số billingPeriodId", 422);
        }
        const [readings, suggestions] = await Promise.all([
            listMeterReadings(billingPeriodId),
            getMeterReadingSuggestions(billingPeriodId),
        ]);
        return ok({ readings, suggestions });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = upsertMeterReadingsSchema.parse(body);
        const count = await upsertMeterReadings(input, admin.id);
        await writeAudit({
            actorId: admin.id,
            action: "METER_READING_UPSERT",
            entityType: "BillingPeriod",
            entityId: input.billingPeriodId,
            metadata: { count },
            ...extractClientInfo(request),
        });
        return ok({ updated: count });
    } catch (error) {
        return handleApiError(error);
    }
}
