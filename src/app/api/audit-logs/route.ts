import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { serializeDate } from "@/lib/serializers";
import type { NextRequest } from "next/server";

/** GET /api/audit-logs → nhật ký hành động (chỉ admin). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
        const limit = Math.min(
            Number(request.nextUrl.searchParams.get("limit") ?? "50"),
            100,
        );

        const [total, logs] = await Promise.all([
            db.auditLog.count(),
            db.auditLog.findMany({
                include: { actor: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return ok({
            data: logs.map((log) => ({
                id: log.id,
                actorName: log.actor?.name ?? "—",
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId,
                ip: log.ip,
                createdAt:
                    serializeDate(log.createdAt) ?? log.createdAt.toISOString(),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
