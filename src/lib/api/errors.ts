/** Lỗi nghiệp vụ — được handleApiError xử lý thành response phù hợp. */
export class DomainError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = "DomainError";
    }
}
