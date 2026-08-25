import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { generateInvoices } from "@/lib/services/billing.service";
import { generateInvoicesSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** POST /api/invoices/generate → tạo hoá đơn hàng loạt cho một kỳ */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = generateInvoicesSchema.parse(body);
        const invoices = await generateInvoices(input);
        await writeAudit({
            actorId: admin.id,
            action: "INVOICE_GENERATE",
            entityType: "BillingPeriod",
            entityId: input.billingPeriodId,
            metadata: { count: invoices.length },
            ...extractClientInfo(request),
        });
        return ok({ count: invoices.length, invoices }, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
