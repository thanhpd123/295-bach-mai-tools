import type { BankAccountDto } from "@/types";

/**
 * Tạo URL ảnh VietQR (chuẩn NAPAS) từ tài khoản nhận tiền + số tiền + nội dung.
 * Dùng dịch vụ tạo ảnh VietQR miễn phí; nếu ảnh lỗi, UI vẫn hiển thị
 * đầy đủ thông tin chuyển khoản dạng text để khách chép tay.
 */
export function buildVietQrImageUrl(
    bank: Pick<BankAccountDto, "bankCode" | "accountNumber" | "accountName">,
    amount: number,
    content: string,
): string {
    const params = new URLSearchParams({
        amount: String(amount),
        addInfo: content,
        accountName: bank.accountName,
    });
    return `https://img.vietqr.io/image/${bank.bankCode}-${bank.accountNumber}-compact.png?${params.toString()}`;
}
