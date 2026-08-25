import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/current-user";

/** GET /api/auth/me → thông tin người dùng hiện tại */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return fail("Chưa đăng nhập", 401);
        return ok(user);
    } catch (error) {
        return handleApiError(error);
    }
}
