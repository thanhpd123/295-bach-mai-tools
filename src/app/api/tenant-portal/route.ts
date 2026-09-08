import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTenantDtoByUserId } from "@/lib/services/tenant.service";
import { getTenantHome } from "@/lib/services/dashboard.service";
import { listInvoicesByTenant } from "@/lib/services/billing.service";

/**
 * GET /api/tenant-portal → toàn bộ dữ liệu cổng người thuê trong 1 request.
 * Giúp client đổi tab (Trang chủ / Hoá đơn / Cá nhân) tức thì mà không cần
 * tải lại trang hay gọi nhiều API riêng lẻ.
 */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return ok({ account: null, home: null, invoices: [], name: null });
        }

        const tenant = await getTenantDtoByUserId(user.id);
        if (!tenant) {
            return ok({ account: null, home: null, invoices: [], name: user.name });
        }

        const [home, invoices] = await Promise.all([
            getTenantHome(tenant.id),
            listInvoicesByTenant(tenant.id),
        ]);

        return ok({ account: tenant, home, invoices, name: user.name });
    } catch (error) {
        return handleApiError(error);
    }
}
