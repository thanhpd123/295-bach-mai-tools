import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { endLease } from "@/lib/services/lease.service";
import { endLeaseSchema } from "@/lib/validation/lease";
import type { NextRequest } from "next/server";

/** POST /api/leases/:id/end → kết thúc hợp đồng (người thuê chuyển đi) */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = endLeaseSchema.parse(body);
        const lease = await endLease(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "LEASE_END",
            entityType: "Lease",
            entityId: id,
            metadata: input,
            ...extractClientInfo(request),
        });
        return ok(lease);
    } catch (error) {
        return handleApiError(error);
    }
}
