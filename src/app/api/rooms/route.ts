import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { listRooms } from "@/lib/services/room.service";
import { roomQuerySchema } from "@/lib/validation/room";
import type { NextRequest } from "next/server";

/** GET /api/rooms → danh sách phòng */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const query = roomQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
        );
        return ok(await listRooms(query));
    } catch (error) {
        return handleApiError(error);
    }
}
