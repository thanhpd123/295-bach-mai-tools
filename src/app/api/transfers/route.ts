import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { listTransfers } from "@/lib/services/billing.service";
import { transferQuerySchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/transfers → danh sách giao dịch chuyển khoản */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const query = transferQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listTransfers(query));
    } catch (error) {
        return handleApiError(error);
    }
}
