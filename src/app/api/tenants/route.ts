import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { createTenant, listTenants } from "@/lib/services/tenant.service";
import {
    createTenantSchema,
    tenantQuerySchema,
} from "@/lib/validation/tenant";
import type { NextRequest } from "next/server";

/** GET /api/tenants → danh sách người thuê; POST → tạo mới + tài khoản */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const query = tenantQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listTenants(query));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = createTenantSchema.parse(body);
        const tenant = await createTenant(input);
        await writeAudit({
            actorId: admin.id,
            action: "TENANT_CREATE",
            entityType: "Tenant",
            entityId: tenant.id,
            ...extractClientInfo(request),
        });
        return ok(tenant, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
