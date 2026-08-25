import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/current-user";
import { extractClientInfo, writeAudit } from "@/lib/services/audit.service";
import {
    createBankAccount,
    listBankAccounts,
} from "@/lib/services/bank.service";
import { bankAccountSchema } from "@/lib/validation/billing";
import type { NextRequest } from "next/server";

/** GET /api/bank-accounts → danh sách tài khoản; POST → thêm tài khoản */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireAdmin();
        return ok(await listBankAccounts());
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const input = bankAccountSchema.parse(body);
        const account = await createBankAccount(input);
        await writeAudit({
            actorId: admin.id,
            action: "BANK_ACCOUNT_CREATE",
            entityType: "BankAccount",
            entityId: account.id,
            ...extractClientInfo(request),
        });
        return ok(account, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
