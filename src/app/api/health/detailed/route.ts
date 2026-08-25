import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { serializeDate } from "@/lib/serializers";
import type { HealthDto } from "@/types";

/** GET /api/health/detailed → sức khoẻ hệ thống chi tiết (chỉ admin). */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireAdmin();

        let database: "ok" | "error" = "ok";
        let databaseLatencyMs = 0;

        const started = Date.now();
        try {
            await db.$queryRaw`SELECT 1`;
            databaseLatencyMs = Date.now() - started;
        } catch {
            database = "error";
        }

        const [lastWebhook, unmatchedTransfers, failedLogins24h] =
            await Promise.all([
                db.transferRecord.findFirst({
                    where: { source: "WEBHOOK" },
                    orderBy: { createdAt: "desc" },
                    select: { createdAt: true },
                }),
                db.transferRecord.count({
                    where: { status: { in: ["UNMATCHED", "REVIEW"] } },
                }),
                db.auditLog.count({
                    where: {
                        action: "LOGIN_FAILED",
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        },
                    },
                }),
            ]);

        const health: HealthDto = {
            status: database === "ok" ? "ok" : "degraded",
            database,
            databaseLatencyMs,
            service: "manager-payment-tools",
            timestamp: new Date().toISOString(),
            lastWebhookAt: serializeDate(lastWebhook?.createdAt ?? null),
            unmatchedTransfers,
            failedLogins24h,
        };

        return ok(health);
    } catch (error) {
        return handleApiError(error);
    }
}
