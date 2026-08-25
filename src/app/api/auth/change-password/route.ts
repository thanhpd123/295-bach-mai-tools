import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/current-user";
import { changePassword } from "@/lib/services/auth.service";
import { changePasswordSchema } from "@/lib/validation/auth";
import type { NextRequest } from "next/server";

/** POST /api/auth/change-password → đổi mật khẩu (cần đăng nhập) */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();
        const input = changePasswordSchema.parse(body);
        await changePassword(user.id, input);
        return ok({ changed: true });
    } catch (error) {
        return handleApiError(error);
    }
}
