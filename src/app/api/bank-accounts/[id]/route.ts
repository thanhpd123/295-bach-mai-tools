import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import {
    deleteBankAccount,
    updateBankAccount,
} from "@/lib/services/bank.service";
import { bankAccountSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** PATCH/DELETE /api/bank-accounts/:id */
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        const body = await request.json();
        const input = bankAccountSchema.partial().parse(body);
        const account = await updateBankAccount(id, input);
        await writeAudit({
            actorId: admin.id,
            action: "BANK_ACCOUNT_UPDATE",
            entityType: "BankAccount",
            entityId: id,
            ...extractClientInfo(request),
        });
        return ok(account);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin();
        const { id } = await context.params;
        await deleteBankAccount(id);
        await writeAudit({
            actorId: admin.id,
            action: "BANK_ACCOUNT_DELETE",
            entityType: "BankAccount",
            entityId: id,
            ...extractClientInfo(request),
        });
        return ok({ deleted: true });
    } catch (error) {
        return handleApiError(error);
    }
}
