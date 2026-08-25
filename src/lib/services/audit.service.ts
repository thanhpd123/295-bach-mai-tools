import { db } from "@/lib/db";

interface AuditInput {
    actorId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: unknown;
    ip?: string | null;
    userAgent?: string | null;
}

/** Ghi nhật ký hành động (fire-and-forget, không chặn luồng chính). */
export async function writeAudit(input: AuditInput): Promise<void> {
    try {
        await db.auditLog.create({
            data: {
                actorId: input.actorId ?? null,
                action: input.action,
                entityType: input.entityType ?? null,
                entityId: input.entityId ?? null,
                metadata: (input.metadata as object | undefined) ?? undefined,
                ip: input.ip ?? null,
                userAgent: input.userAgent ?? null,
            },
        });
    } catch {
        // Ghi log không được phép làm hỏng nghiệp vụ chính.
    }
}

/** Trích xuất IP & user-agent từ NextRequest (dùng trong route handler). */
export function extractClientInfo(request: Request) {
    const userAgent = request.headers.get("user-agent");
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? null;
    return { ip, userAgent };
}
