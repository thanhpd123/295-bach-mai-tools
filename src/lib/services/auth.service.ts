import { db } from "@/lib/db";
import { AuthError } from "@/lib/auth/errors";
import {
    DUMMY_PASSWORD_HASH,
    hashPassword,
    verifyPassword,
} from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/services/audit.service";
import type { ChangePasswordInput, LoginInput } from "@/lib/validation/auth";
import type { LoginResult, SessionUser } from "@/types";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** Đăng nhập bằng tên tài khoản hoặc email + mật khẩu; tự khoá tài khoản sau 5 lần sai. */
export async function login(
    input: LoginInput,
    clientInfo: { ip: string | null; userAgent: string | null },
): Promise<LoginResult> {
    const account = input.account.trim();
    const emailLookup = account.toLowerCase();
    const user = await db.user.findFirst({
        where: {
            OR: [
                { email: emailLookup },
                { username: { equals: account, mode: "insensitive" } },
            ],
        },
    });

    const locked =
        user !== null &&
        user.lockedUntil !== null &&
        user.lockedUntil > new Date();

    // Chống timing-based user enumeration: luôn chạy một phép bcrypt.compare,
    // dùng hash giả khi tài khoản không tồn tại / bị vô hiệu hoá / đang bị khoá.
    if (!user || !user.isActive || locked) {
        await verifyPassword(input.password, DUMMY_PASSWORD_HASH);
    }

    if (!user || !user.isActive) {
        throw new AuthError(401, "Tài khoản hoặc mật khẩu không đúng");
    }

    if (locked) {
        throw new AuthError(
            423,
            "Tài khoản tạm khoá do nhập sai nhiều lần, vui lòng thử lại sau",
        );
    }

    const passwordOk = await verifyPassword(input.password, user.passwordHash);

    if (!passwordOk) {
        const failedAttempts = user.failedAttempts + 1;
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            await db.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: 0,
                    lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
                },
            });
        } else {
            await db.user.update({
                where: { id: user.id },
                data: { failedAttempts },
            });
        }
        await writeAudit({
            actorId: user.id,
            action: "LOGIN_FAILED",
            ip: clientInfo.ip,
            userAgent: clientInfo.userAgent,
        });
        throw new AuthError(401, "Tài khoản hoặc mật khẩu không đúng");
    }

    await db.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
    });

    const sessionUser: SessionUser = {
        id: user.id,
        role: user.role,
        name: user.name,
    };
    await createSession({
        sub: sessionUser.id,
        role: sessionUser.role,
        name: sessionUser.name,
    });

    await writeAudit({
        actorId: user.id,
        action: "LOGIN",
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
    });

    return {
        user: { ...sessionUser, mustChangePassword: user.mustChangePassword },
        redirectTo: user.role === "ADMIN" ? "/dashboard" : "/app",
    };
}

/** Đổi mật khẩu (yêu cầu nhập mật khẩu hiện tại). */
export async function changePassword(
    userId: string,
    input: ChangePasswordInput,
): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError(401, "Vui lòng đăng nhập");

    const ok = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!ok) throw new AuthError(400, "Mật khẩu hiện tại không đúng");

    await db.user.update({
        where: { id: userId },
        data: {
            passwordHash: await hashPassword(input.newPassword),
            mustChangePassword: false,
            failedAttempts: 0,
            lockedUntil: null,
        },
    });
}
