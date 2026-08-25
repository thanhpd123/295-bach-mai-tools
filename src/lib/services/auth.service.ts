import { db } from "@/lib/db";
import { AuthError } from "@/lib/auth/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { writeAudit } from "@/lib/services/audit.service";
import type { ChangePasswordInput, LoginInput } from "@/lib/validation/auth";
import type { LoginResult, SessionUser } from "@/types";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** Đăng nhập bằng email + mật khẩu; tự khoá tài khoản sau 5 lần sai. */
export async function login(
    input: LoginInput,
    clientInfo: { ip: string | null; userAgent: string | null },
): Promise<LoginResult> {
    const user = await db.user.findUnique({ where: { email: input.email } });

    const invalidCredentials = () => {
        throw new AuthError(401, "Email hoặc mật khẩu không đúng");
    };

    if (!user || !user.isActive) invalidCredentials();

    if (user.lockedUntil && user.lockedUntil > new Date()) {
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
        invalidCredentials();
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
    await createSession(sessionUser);

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
