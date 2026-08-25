import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Băm mật khẩu trước khi lưu vào DB. */
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
}

/** So sánh mật khẩu nhập vào với hash đã lưu. */
export async function verifyPassword(
    plain: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}
