import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { resetTenantPassword } from "@/lib/services/tenant.service";
import { resetPasswordSchema } from "@/lib/validation/tenant";
import type { NextRequest } from "next/server";

/** POST /api/tenants/:id/reset-password → đặt lại mật khẩu người thuê */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = resetPasswordSchema.parse(body);
        await resetTenantPassword(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "TENANT_RESET_PASSWORD",
            entityType: "Tenant",
            entityId: id,
            ...extractClientInfo(request),
        });
        return ok({ reset: true });
    } catch (error) {
        return handleApiError(error);
    }
}
