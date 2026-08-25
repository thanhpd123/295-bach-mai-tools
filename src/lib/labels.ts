import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

/** Nhãn hiển thị cho trạng thái thanh toán */
export const paymentStatusLabels: Record<PaymentStatus, string> = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn tiền",
    CANCELLED: "Đã huỷ",
};

/** Nhãn hiển thị cho phương thức thanh toán */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
};
