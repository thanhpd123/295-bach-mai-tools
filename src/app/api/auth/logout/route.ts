import { deleteSession } from "@/lib/auth/session";
import { ok } from "@/lib/api/response";

/** POST /api/auth/logout → xoá session */
export const dynamic = "force-dynamic";

export async function POST() {
    await deleteSession();
    return ok({ loggedOut: true });
}
