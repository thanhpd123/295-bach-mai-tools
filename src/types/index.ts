import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

/**
 * DTO (Data Transfer Object) — dữ liệu đã được serialize để trả về client.
 * Khác với model Prisma ở chỗ Decimal → number, Date → ISO string.
 */

export interface PaymentItemDto {
    id: string;
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface PaymentDto {
    id: string;
    code: string;
    patientId: string;
    patientName: string;
    status: PaymentStatus;
    method: PaymentMethod;
    totalAmount: number;
    note: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    items: PaymentItemDto[];
}

export interface PaginatedMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Paginated<T> {
    data: T[];
    meta: PaginatedMeta;
}

/** Chuẩn hoá response của các API nội bộ */
export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiError {
    success: false;
    error: {
        message: string;
        details?: unknown;
    };
}
