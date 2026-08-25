/**
 * Các hàm tiện ích dùng chung cho cả server & client.
 */

/** Gộp class name (thay thế clsx đơn giản). */
export function cn(
    ...inputs: Array<string | false | null | undefined>
): string {
    return inputs.filter(Boolean).join(" ");
}

/** Định dạng số tiền VND, ví dụ: 1.250.000 ₫ */
export function formatCurrency(
    value: number | string | null | undefined,
): string {
    const amount = typeof value === "string" ? Number(value) : value;
    if (amount == null || Number.isNaN(amount)) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

/** Định dạng ngày giờ theo múi giờ Việt Nam. */
export function formatDate(
    value: Date | string | number | null | undefined,
): string {
    if (value == null) return "—";
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
