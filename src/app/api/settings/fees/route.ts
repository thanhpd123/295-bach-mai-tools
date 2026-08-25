import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { getFeeSettings, saveFeeSettings } from "@/lib/settings";
import { feeSettingsSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/settings/fees → đơn giá; PUT → cập nhật đơn giá */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireAdmin();
        return ok(await getFeeSettings());
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const input = feeSettingsSchema.parse(body);
        return ok(await saveFeeSettings(input));
    } catch (error) {
        return handleApiError(error);
    }
}
