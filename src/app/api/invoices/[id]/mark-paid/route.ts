import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { markInvoicePaid } from "@/lib/services/billing.service";
import { markPaidSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** POST /api/invoices/:id/mark-paid → xác nhận thanh toán thủ công */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = markPaidSchema.parse(body);
        const invoice = await markInvoicePaid(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "INVOICE_MARK_PAID",
            entityType: "Invoice",
            entityId: id,
            metadata: input,
            ...extractClientInfo(request),
        });
        return ok(invoice);
    } catch (error) {
        return handleApiError(error);
    }
}
