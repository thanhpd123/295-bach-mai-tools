import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { listInvoices } from "@/lib/services/billing.service";
import { invoiceQuerySchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/invoices → danh sách hoá đơn */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const query = invoiceQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listInvoices(query));
    } catch (error) {
        return handleApiError(error);
    }
}
