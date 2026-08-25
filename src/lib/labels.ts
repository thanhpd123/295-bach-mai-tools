import type {
    FeeType,
    InvoiceStatus,
    LeaseStatus,
    RoomStatus,
    TransferStatus,
    UserRole,
} from "@/generated/prisma/enums";

/** Nhãn hiển thị vai trò */
export const userRoleLabels: Record<UserRole, string> = {
    ADMIN: "Chủ nhà / Quản lý",
    TENANT: "Người thuê",
};

/** Nhãn trạng thái phòng */
export const roomStatusLabels: Record<RoomStatus, string> = {
    VACANT: "Đang trống",
    OCCUPIED: "Đang thuê",
    MAINTENANCE: "Bảo trì",
};

/** Nhãn trạng thái hợp đồng */
export const leaseStatusLabels: Record<LeaseStatus, string> = {
    ACTIVE: "Đang ở",
    ENDED: "Đã chuyển đi",
};

/** Nhãn trạng thái hoá đơn */
export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
    DRAFT: "Nháp",
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    OVERDUE: "Quá hạn",
    CANCELLED: "Đã huỷ",
};

/** Nhãn loại khoản phí */
export const feeTypeLabels: Record<FeeType, string> = {
    RENT: "Tiền phòng",
    ELECTRICITY: "Tiền điện",
    WATER: "Tiền nước",
    CLEANING: "Vệ sinh",
    INTERNET: "Internet",
    ELEVATOR: "Thang máy",
    MOTORCYCLE: "Gửi xe máy",
    OTHER: "Khác",
};

/** Nhãn trạng thái giao dịch */
export const transferStatusLabels: Record<TransferStatus, string> = {
    MATCHED: "Đã khớp",
    UNMATCHED: "Chưa khớp",
    DUPLICATE: "Trùng lặp",
    REVIEW: "Cần xem xét",
};
