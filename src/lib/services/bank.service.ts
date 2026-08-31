import { db } from "@/lib/db";
import type { BankAccountInput } from "@/lib/validation/billing";
import type { BankAccountDto } from "@/types";

function serializeAccount(account: {
    id: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isActive: boolean;
}): BankAccountDto {
    return {
        id: account.id,
        bankName: account.bankName,
        bankCode: account.bankCode,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        isActive: account.isActive,
    };
}

export async function listBankAccounts(): Promise<BankAccountDto[]> {
    const accounts = await db.bankAccount.findMany({
        orderBy: { createdAt: "asc" },
    });
    return accounts.map(serializeAccount);
}

export async function getActiveBankAccount(): Promise<BankAccountDto | null> {
    const account = await db.bankAccount.findFirst({
        where: { isActive: true },
    });
    return account ? serializeAccount(account) : null;
}

export async function createBankAccount(
    input: BankAccountInput,
): Promise<BankAccountDto> {
    return db.$transaction(async (tx) => {
        // Chỉ cho phép một tài khoản active.
        if (input.isActive) {
            await tx.bankAccount.updateMany({
                data: { isActive: false },
            });
        }
        const account = await tx.bankAccount.create({ data: input });
        return serializeAccount(account);
    });
}

export async function updateBankAccount(
    id: string,
    input: Partial<BankAccountInput>,
): Promise<BankAccountDto> {
    return db.$transaction(async (tx) => {
        if (input.isActive) {
            await tx.bankAccount.updateMany({ data: { isActive: false } });
        }
        const account = await tx.bankAccount.update({
            where: { id },
            data: input,
        });
        return serializeAccount(account);
    });
}

export async function deleteBankAccount(id: string): Promise<void> {
    await db.bankAccount.delete({ where: { id } });
}
