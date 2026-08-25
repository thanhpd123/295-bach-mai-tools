import type { PaymentUncheckedUpdateInput } from "@/generated/prisma/models/Payment";
import { db } from "@/lib/db";
import { decimalToNumber, serializeDate } from "@/lib/serializers";
import type {
    CreatePaymentInput,
    PaymentQuery,
    UpdatePaymentInput,
} from "@/lib/validation/payment";
import type { Paginated, PaymentDto } from "@/types";

/**
 * Service layer cho nghiệp vụ thanh toán.
 * Route handler (app/api/...) chỉ làm nhiệm vụ parse request và trả response,
 * mọi logic truy vấn DB nằm ở đây để dễ test & tái sử dụng.
 */

const paymentInclude = {
    patient: true,
    items: { include: { service: true } },
} as const;

/** Kiểu dữ liệu thô trả về từ Prisma (trước khi serialize) */
type RawPayment = {
    id: string;
    code: string;
    patientId: string;
    status: "PENDING" | "PAID" | "REFUNDED" | "CANCELLED";
    method: "CASH" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY";
    totalAmount: unknown;
    note: string | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    patient?: { name: string } | null;
    items?: Array<{
        id: string;
        serviceId: string;
        quantity: number;
        unitPrice: unknown;
        total: unknown;
        service?: { name: string } | null;
    }>;
};

/** Serialize dữ liệu Prisma → DTO JSON an toàn */
function serializePayment(payment: RawPayment): PaymentDto {
    return {
        id: payment.id,
        code: payment.code,
        patientId: payment.patientId,
        patientName: payment.patient?.name ?? "—",
        status: payment.status,
        method: payment.method,
        totalAmount: decimalToNumber(payment.totalAmount),
        note: payment.note,
        paidAt: serializeDate(payment.paidAt),
        createdAt:
            serializeDate(payment.createdAt) ?? payment.createdAt.toISOString(),
        updatedAt:
            serializeDate(payment.updatedAt) ?? payment.updatedAt.toISOString(),
        items: (payment.items ?? []).map((item) => ({
            id: item.id,
            serviceId: item.serviceId,
            serviceName: item.service?.name ?? "—",
            quantity: item.quantity,
            unitPrice: decimalToNumber(item.unitPrice),
            total: decimalToNumber(item.total),
        })),
    };
}

/** Danh sách phiếu thanh toán (phân trang + tìm kiếm + lọc trạng thái) */
export async function listPayments(
    query: PaymentQuery,
): Promise<Paginated<PaymentDto>> {
    const { page, limit, search, status } = query;

    const where = {
        ...(status ? { status } : {}),
        ...(search
            ? {
                OR: [
                    { code: { contains: search, mode: "insensitive" as const } },
                    {
                        patient: {
                            name: { contains: search, mode: "insensitive" as const },
                        },
                    },
                ],
            }
            : {}),
    };

    const [total, payments] = await Promise.all([
        db.payment.count({ where }),
        db.payment.findMany({
            where,
            include: paymentInclude,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: payments.map((payment) => serializePayment(payment)),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/** Chi tiết một phiếu thanh toán */
export async function getPaymentById(id: string): Promise<PaymentDto | null> {
    const payment = await db.payment.findUnique({
        where: { id },
        include: paymentInclude,
    });

    return payment ? serializePayment(payment) : null;
}

/** Tạo mới phiếu thanh toán cùng các dòng dịch vụ (atomic) */
export async function createPayment(
    input: CreatePaymentInput,
): Promise<PaymentDto> {
    const count = await db.payment.count();
    const code = `PT-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    const totalAmount = input.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
    );

    const payment = await db.payment.create({
        data: {
            code,
            patientId: input.patientId,
            method: input.method,
            status: input.status,
            totalAmount,
            note: input.note ?? null,
            paidAt: input.status === "PAID" ? new Date() : null,
            items: {
                create: input.items.map((item) => ({
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.quantity * item.unitPrice,
                })),
            },
        },
        include: paymentInclude,
    });

    return serializePayment(payment);
}

/** Cập nhật phiếu thanh toán */
export async function updatePayment(
    id: string,
    input: UpdatePaymentInput,
): Promise<PaymentDto> {
    const data = {
        ...(input.patientId !== undefined && { patientId: input.patientId }),
        ...(input.method !== undefined && { method: input.method }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.note !== undefined && { note: input.note }),
        ...(input.status === "PAID" && { paidAt: new Date() }),
        ...(input.items !== undefined && {
            totalAmount: input.items.reduce(
                (sum, item) => sum + item.quantity * item.unitPrice,
                0,
            ),
            items: {
                deleteMany: {},
                create: input.items.map((item) => ({
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.quantity * item.unitPrice,
                })),
            },
        }),
    } satisfies PaymentUncheckedUpdateInput;

    const payment = await db.payment.update({
        where: { id },
        data,
        include: paymentInclude,
    });

    return serializePayment(payment);
}

/** Xoá phiếu thanh toán (các dòng dịch vụ bị cascade) */
export async function deletePayment(id: string): Promise<void> {
    await db.payment.delete({ where: { id } });
}
