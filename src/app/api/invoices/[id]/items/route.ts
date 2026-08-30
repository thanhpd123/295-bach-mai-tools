import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { updateInvoiceItems } from "@/lib/services/billing.service";
import { updateInvoiceItemsSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** PATCH /api/invoices/:id/items → sửa từng dòng khoản phí */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = updateInvoiceItemsSchema.parse(body);
        const invoice = await updateInvoiceItems(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "INVOICE_ITEMS_UPDATE",
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
