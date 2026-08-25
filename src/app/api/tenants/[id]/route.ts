import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import {
    deleteTenant,
    getTenantById,
    updateTenant,
} from "@/lib/services/tenant.service";
import { updateTenantSchema } from "@/lib/validation/tenant";
import type { NextRequest } from "next/server";

/** GET/PATCH/DELETE /api/tenants/:id */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        await requireAdmin();
        const { id } = await context.params;
        const tenant = await getTenantById(id);
        if (!tenant) return fail("Không tìm thấy người thuê", 404);
        return ok(tenant);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = updateTenantSchema.parse(body);
        const tenant = await updateTenant(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "TENANT_UPDATE",
            entityType: "Tenant",
            entityId: id,
            ...extractClientInfo(request),
        });
        return ok(tenant);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        await deleteTenant(id);
        await writeAudit({
            actorId: admin.id,
            action: "TENANT_DELETE",
            entityType: "Tenant",
            entityId: id,
            ...extractClientInfo(request),
        });
        return ok({ deleted: true });
    } catch (error) {
        return handleApiError(error);
    }
}
