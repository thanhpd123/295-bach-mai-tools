/** Lỗi xác thực/phân quyền — được handleApiError xử lý thành response phù hợp. */
export class AuthError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = "AuthError";
    }
}
