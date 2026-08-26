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

/**
 * Hash giả (cùng 12 vòng) dùng để cân bằng thời gian phản hồi khi tài khoản
 * không tồn tại / bị vô hiệu hoá / đang bị khoá — chống tấn công liệt kê tài khoản
 * qua thời gian (timing-based user enumeration).
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
    "dummy-password-for-timing",
    SALT_ROUNDS,
);
