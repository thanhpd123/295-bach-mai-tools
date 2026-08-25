import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDashboardStats } from "@/lib/services/dashboard.service";

/** GET /api/dashboard/stats → số liệu tổng quan */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireAdmin();
        return ok(await getDashboardStats());
    } catch (error) {
        return handleApiError(error);
    }
}
