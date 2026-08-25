import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { createLease, listLeases } from "@/lib/services/lease.service";
import { createLeaseSchema, leaseQuerySchema } from "@/lib/validation/lease";
import type { NextRequest } from "next/server";

/** GET /api/leases → danh sách hợp đồng; POST → người thuê chuyển vào */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const query = leaseQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listLeases(query));
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = createLeaseSchema.parse(body);
        const lease = await createLease(input);
        await writeAudit({
            actorId: admin.id,
            action: "LEASE_CREATE",
            entityType: "Lease",
            entityId: lease.id,
            metadata: input,
            ...extractClientInfo(request),
        });
        return ok(lease, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
