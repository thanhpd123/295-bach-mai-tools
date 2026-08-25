import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { getInvoiceById, updateInvoice } from "@/lib/services/billing.service";
import { updateInvoiceSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET/PATCH /api/invoices/:id */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    try {
        await requireAdmin();
        const { id } = await context.params;
        const invoice = await getInvoiceById(id);
        if (!invoice) return fail("Không tìm thấy hoá đơn", 404);
        return ok(invoice);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = updateInvoiceSchema.parse(body);
        const invoice = await updateInvoice(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "INVOICE_UPDATE",
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
