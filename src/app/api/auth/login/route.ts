import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { extractClientInfo } from "@/lib/services/audit.service";
import { login } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validation/auth";
import type { NextRequest } from "next/server";

/** POST /api/auth/login → đăng nhập, set cookie session */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = loginSchema.parse(body);
        const result = await login(input, extractClientInfo(request));
        return ok(result);
    } catch (error) {
        return handleApiError(error);
    }
}
