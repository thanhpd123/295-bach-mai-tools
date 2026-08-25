import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import { updateRoom } from "@/lib/services/room.service";
import { updateRoomSchema } from "@/lib/validation/room";
import type { NextRequest } from "next/server";

/** PATCH /api/rooms/:id → cập nhật phòng (giá, trạng thái trống...) */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = updateRoomSchema.parse(body);

        const room = await updateRoom(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "ROOM_UPDATE",
            entityType: "Room",
            entityId: id,
            metadata: input,
            ...extractClientInfo(request),
        });
        return ok(room);
    } catch (error) {
        return handleApiError(error);
    }
}
