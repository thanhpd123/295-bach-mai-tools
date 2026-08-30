import { db } from "@/lib/db";
import { DomainError } from "@/lib/api/errors";
import { decimalToNumber, serializeDate } from "@/lib/serializers";
import { getFeeSettings } from "@/lib/settings";
import type {
    CreateBillingPeriodInput,
    GenerateInvoicesInput,
    InvoiceQuery,
    MarkPaidInput,
    TransferQuery,
    UpdateInvoiceInput,
    UpdateInvoiceItemsInput,
    UpsertMeterReadingsInput,
} from "@/lib/validation/billing";
import type {
    BillingPeriodDto,
    InvoiceDto,
    InvoiceItemDto,
    MeterReadingDto,
    Paginated,
    TransferRecordDto,
} from "@/types";
import type { FeeType } from "@/generated/prisma/enums";

// ------------------------------------------------------------
// Serializers
// ------------------------------------------------------------

const invoiceInclude = {
    room: true,
    billingPeriod: true,
    tenant: true,
    items: true,
} as const;

type RawInvoice = {
    id: string;
    code: string;
    roomId: string;
    billingPeriodId: string;
    tenantId: string | null;
    status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
    dueDate: Date;
    totalAmount: unknown;
    paidAmount: unknown;
    note: string | null;
    paidAt: Date | null;
    createdAt: Date;
    room: { number: string };
    billingPeriod: { code: string };
    tenant: { fullName: string } | null;
    tenantName: string | null;
    items: Array<{
        id: string;
        feeType: FeeType;
        description: string;
        quantity: number;
        unitPrice: unknown;
        total: unknown;
    }>;
};

function serializeInvoice(invoice: RawInvoice): InvoiceDto {
    return {
        id: invoice.id,
        code: invoice.code,
        roomId: invoice.roomId,
        roomNumber: invoice.room.number,
        billingPeriodId: invoice.billingPeriodId,
        billingPeriodCode: invoice.billingPeriod.code,
        tenantId: invoice.tenantId,
        tenantName: invoice.tenantName ?? invoice.tenant?.fullName ?? null,
        status: invoice.status,
        dueDate: serializeDate(invoice.dueDate) ?? invoice.dueDate.toISOString(),
        totalAmount: decimalToNumber(invoice.totalAmount),
        paidAmount: decimalToNumber(invoice.paidAmount),
        note: invoice.note,
        paidAt: serializeDate(invoice.paidAt),
        createdAt:
            serializeDate(invoice.createdAt) ?? invoice.createdAt.toISOString(),
        items: invoice.items.map((item) => ({
            id: item.id,
            feeType: item.feeType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: decimalToNumber(item.unitPrice),
            total: decimalToNumber(item.total),
        })),
    };
}

function serializePeriod(period: {
    id: string;
    code: string;
    month: number;
    year: number;
    startDate: Date;
    endDate: Date;
    dueDate: Date;
    status: "OPEN" | "CLOSED";
    createdAt: Date;
}): BillingPeriodDto {
    return {
        id: period.id,
        code: period.code,
        month: period.month,
        year: period.year,
        startDate:
            serializeDate(period.startDate) ?? period.startDate.toISOString(),
        endDate: serializeDate(period.endDate) ?? period.endDate.toISOString(),
        dueDate: serializeDate(period.dueDate) ?? period.dueDate.toISOString(),
        status: period.status,
        createdAt:
            serializeDate(period.createdAt) ?? period.createdAt.toISOString(),
    };
}

function serializeMeterReading(reading: {
    id: string;
    roomId: string;
    billingPeriodId: string;
    electricityOld: number;
    electricityNew: number;
    waterOld: number;
    waterNew: number;
    peopleCount: number;
    motorcycleCount: number;
    room: { number: string };
}): MeterReadingDto {
    return {
        id: reading.id,
        roomId: reading.roomId,
        roomNumber: reading.room.number,
        billingPeriodId: reading.billingPeriodId,
        electricityOld: reading.electricityOld,
        electricityNew: reading.electricityNew,
        waterOld: reading.waterOld,
        waterNew: reading.waterNew,
        electricityUsage: reading.electricityNew - reading.electricityOld,
        waterUsage: reading.waterNew - reading.waterOld,
        peopleCount: reading.peopleCount,
        motorcycleCount: reading.motorcycleCount,
    };
}

// ------------------------------------------------------------
// Billing periods
// ------------------------------------------------------------

export async function listBillingPeriods(): Promise<BillingPeriodDto[]> {
    const periods = await db.billingPeriod.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return periods.map(serializePeriod);
}

export async function getBillingPeriod(
    id: string,
): Promise<BillingPeriodDto | null> {
    const period = await db.billingPeriod.findUnique({ where: { id } });
    return period ? serializePeriod(period) : null;
}

export async function getOpenBillingPeriod(): Promise<BillingPeriodDto | null> {
    const period = await db.billingPeriod.findFirst({
        where: { status: "OPEN" },
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return period ? serializePeriod(period) : null;
}

export async function createBillingPeriod(
    input: CreateBillingPeriodInput,
): Promise<BillingPeriodDto> {
    const { month, year } = input;
    const code = `${year}-${String(month).padStart(2, "0")}`;

    const exists = await db.billingPeriod.findUnique({ where: { code } });
    if (exists) throw new DomainError(409, "Kỳ thanh toán này đã tồn tại");

    const fees = await getFeeSettings();
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    // Hạn thanh toán: ngày dueDay của tháng KẾ TIẾP.
    const nextMonthIndex = month === 12 ? 0 : month;
    const dueYear = month === 12 ? year + 1 : year;
    const dueDate = new Date(Date.UTC(dueYear, nextMonthIndex, fees.dueDay));

    const period = await db.billingPeriod.create({
        data: { code, month, year, startDate, endDate, dueDate },
    });
    return serializePeriod(period);
}

export async function closeBillingPeriod(
    id: string,
): Promise<BillingPeriodDto> {
    const period = await db.billingPeriod.update({
        where: { id },
        data: { status: "CLOSED" },
    });
    return serializePeriod(period);
}

// ------------------------------------------------------------
// Meter readings
// ------------------------------------------------------------

export async function listMeterReadings(
    billingPeriodId: string,
): Promise<MeterReadingDto[]> {
    const readings = await db.meterReading.findMany({
        where: { billingPeriodId },
        include: { room: true },
        orderBy: { roomId: "asc" },
    });
    return readings.map(serializeMeterReading);
}

/**
 * Gợi ý chỉ số "cũ" cho từng phòng khi nhập kỳ mới:
 * lấy từ chỉ số mới của kỳ liền trước; nếu chưa có (phòng mới có người thuê)
 * thì lấy từ endElectricity/endWater của hợp đồng đã kết thúc gần nhất.
 */
export async function getMeterReadingSuggestions(
    billingPeriodId: string,
): Promise<Record<string, { electricityOld: number; waterOld: number }>> {
    const period = await db.billingPeriod.findUnique({
        where: { id: billingPeriodId },
    });
    if (!period) throw new DomainError(404, "Không tìm thấy kỳ thanh toán");

    const previousPeriod = await db.billingPeriod.findFirst({
        where: {
            OR: [
                { year: { lt: period.year } },
                { year: period.year, month: { lt: period.month } },
            ],
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    const previousReadings = previousPeriod
        ? await db.meterReading.findMany({
            where: { billingPeriodId: previousPeriod.id },
        })
        : [];

    const endedLeases = await db.lease.findMany({
        where: { status: "ENDED" },
        orderBy: { endDate: "desc" },
    });

    const map: Record<string, { electricityOld: number; waterOld: number }> =
        {};
    for (const r of previousReadings) {
        map[r.roomId] = {
            electricityOld: r.electricityNew,
            waterOld: r.waterNew,
        };
    }
    for (const lease of endedLeases) {
        if (
            !map[lease.roomId] &&
            (lease.endElectricity != null || lease.endWater != null)
        ) {
            map[lease.roomId] = {
                electricityOld: lease.endElectricity ?? 0,
                waterOld: lease.endWater ?? 0,
            };
        }
    }
    return map;
}

export async function upsertMeterReadings(
    input: UpsertMeterReadingsInput,
    actorId: string,
): Promise<number> {
    const period = await db.billingPeriod.findUnique({
        where: { id: input.billingPeriodId },
    });
    if (!period) throw new DomainError(404, "Không tìm thấy kỳ thanh toán");

    // Tìm kỳ liền trước để carry-forward chỉ số cũ.
    const previousPeriod = await db.billingPeriod.findFirst({
        where: {
            OR: [
                { year: { lt: period.year } },
                { year: period.year, month: { lt: period.month } },
            ],
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    const previousReadings = previousPeriod
        ? await db.meterReading.findMany({
            where: { billingPeriodId: previousPeriod.id },
        })
        : [];
    const prevByRoom = new Map(previousReadings.map((r) => [r.roomId, r]));

    // Nếu phòng chưa có chỉ số kỳ trước (người mới chuyển vào), dùng chỉ số cuối
    // của hợp đồng đã kết thúc (endElectricity/endWater) làm chỉ số cũ.
    const roomIds = input.readings.map((r) => r.roomId);
    const endedLeases = await db.lease.findMany({
        where: { roomId: { in: roomIds }, status: "ENDED" },
        orderBy: { endDate: "desc" },
    });
    const endedByRoom = new Map<
        string,
        { electricity: number | null; water: number | null }
    >();
    for (const lease of endedLeases) {
        if (!endedByRoom.has(lease.roomId)) {
            endedByRoom.set(lease.roomId, {
                electricity: lease.endElectricity,
                water: lease.endWater,
            });
        }
    }

    await db.$transaction(
        input.readings.map((item) => {
            const prev = prevByRoom.get(item.roomId);
            const ended = endedByRoom.get(item.roomId);
            const electricityOld =
                item.electricityOld ??
                prev?.electricityNew ??
                ended?.electricity ??
                0;
            const waterOld =
                item.waterOld ?? prev?.waterNew ?? ended?.water ?? 0;

            if (item.electricityNew < electricityOld) {
                throw new DomainError(
                    422,
                    `Phòng ${item.roomId}: số điện mới phải ≥ số điện cũ`,
                );
            }
            if (item.waterNew < waterOld) {
                throw new DomainError(
                    422,
                    `Phòng ${item.roomId}: số nước mới phải ≥ số nước cũ`,
                );
            }

            return db.meterReading.upsert({
                where: {
                    roomId_billingPeriodId: {
                        roomId: item.roomId,
                        billingPeriodId: input.billingPeriodId,
                    },
                },
                create: {
                    roomId: item.roomId,
                    billingPeriodId: input.billingPeriodId,
                    electricityOld,
                    electricityNew: item.electricityNew,
                    waterOld,
                    waterNew: item.waterNew,
                    peopleCount: item.peopleCount ?? 1,
                    motorcycleCount: item.motorcycleCount ?? 0,
                    recordedById: actorId,
                },
                update: {
                    electricityOld,
                    electricityNew: item.electricityNew,
                    waterOld,
                    waterNew: item.waterNew,
                    peopleCount: item.peopleCount ?? 1,
                    motorcycleCount: item.motorcycleCount ?? 0,
                    recordedById: actorId,
                },
            });
        }),
    );

    return input.readings.length;
}

// ------------------------------------------------------------
// Invoices
// ------------------------------------------------------------

interface ComputedLine {
    feeType: FeeType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

function computeLines(args: {
    baseRent: number;
    electricityUsage: number;
    waterUsage: number;
    peopleCount: number;
    motorcycleCount: number;
    fees: {
        electricityUnitPrice: number;
        waterUnitPrice: number;
        motorcycleUnitPrice: number;
        cleaningFee: number;
        internetFee: number;
        elevatorFee: number;
    };
}): ComputedLine[] {
    const {
        baseRent,
        electricityUsage,
        waterUsage,
        peopleCount,
        motorcycleCount,
        fees,
    } = args;

    const lines: ComputedLine[] = [
        {
            feeType: "RENT",
            description: "Tiền phòng",
            quantity: 1,
            unitPrice: baseRent,
            total: baseRent,
        },
        {
            feeType: "ELECTRICITY",
            description: `Tiền điện (${electricityUsage} kWh)`,
            quantity: electricityUsage,
            unitPrice: fees.electricityUnitPrice,
            total: electricityUsage * fees.electricityUnitPrice,
        },
        {
            feeType: "WATER",
            description: `Tiền nước (${waterUsage} m³)`,
            quantity: waterUsage,
            unitPrice: fees.waterUnitPrice,
            total: waterUsage * fees.waterUnitPrice,
        },
        {
            feeType: "MOTORCYCLE",
            description: `Gửi xe máy (${motorcycleCount} xe)`,
            quantity: motorcycleCount,
            unitPrice: fees.motorcycleUnitPrice,
            total: motorcycleCount * fees.motorcycleUnitPrice,
        },
        {
            feeType: "CLEANING",
            description: `Phí vệ sinh (${peopleCount} người)`,
            quantity: peopleCount,
            unitPrice: fees.cleaningFee,
            total: peopleCount * fees.cleaningFee,
        },
        {
            feeType: "INTERNET",
            description: "Internet",
            quantity: 1,
            unitPrice: fees.internetFee,
            total: fees.internetFee,
        },
        {
            feeType: "ELEVATOR",
            description: `Thang máy (${peopleCount} người)`,
            quantity: peopleCount,
            unitPrice: fees.elevatorFee,
            total: peopleCount * fees.elevatorFee,
        },
    ];

    return lines.filter((line) => line.total > 0);
}

export async function generateInvoices(
    input: GenerateInvoicesInput,
): Promise<InvoiceDto[]> {
    const period = await db.billingPeriod.findUnique({
        where: { id: input.billingPeriodId },
    });
    if (!period) throw new DomainError(404, "Không tìm thấy kỳ thanh toán");

    const fees = await getFeeSettings();
    const yy = String(period.year).slice(-2);
    const mm = String(period.month).padStart(2, "0");

    const readings = await db.meterReading.findMany({
        where: {
            billingPeriodId: period.id,
            ...(input.roomIds?.length ? { roomId: { in: input.roomIds } } : {}),
        },
        include: { room: true },
    });

    if (readings.length === 0) {
        throw new DomainError(400, "Chưa có chỉ số điện/nước để tạo hoá đơn");
    }

    const created: InvoiceDto[] = [];

    await db.$transaction(async (tx) => {
        for (const reading of readings) {
            const room = reading.room;
            const lines = computeLines({
                baseRent: decimalToNumber(room.baseRent),
                electricityUsage: reading.electricityNew - reading.electricityOld,
                waterUsage: reading.waterNew - reading.waterOld,
                peopleCount: reading.peopleCount,
                motorcycleCount: reading.motorcycleCount,
                fees,
            });
            const totalAmount = lines.reduce((sum, l) => sum + l.total, 0);
            const code = `HD-${yy}${mm}-${room.number}`;

            const lease = await tx.lease.findFirst({
                where: { roomId: room.id, status: "ACTIVE" },
                include: { tenant: { select: { fullName: true } } },
            });

            // Xoá hoá đơn cũ chưa thanh toán của phòng+kỳ để tạo lại (regenerate).
            await tx.invoice.deleteMany({
                where: {
                    roomId: room.id,
                    billingPeriodId: period.id,
                    status: { in: ["DRAFT", "PENDING", "CANCELLED"] },
                },
            });

            const invoice = await tx.invoice.create({
                data: {
                    code,
                    roomId: room.id,
                    billingPeriodId: period.id,
                    tenantId: lease?.tenantId ?? null,
                    tenantName: lease?.tenant.fullName ?? null,
                    status: "PENDING",
                    dueDate: period.dueDate,
                    totalAmount,
                    items: {
                        create: lines.map((l) => ({
                            feeType: l.feeType,
                            description: l.description,
                            quantity: l.quantity,
                            unitPrice: l.unitPrice,
                            total: l.total,
                        })),
                    },
                },
                include: invoiceInclude,
            });

            created.push(
                serializeInvoice(invoice as unknown as RawInvoice),
            );
        }
    });

    return created;
}

export async function listInvoices(
    query: InvoiceQuery,
): Promise<Paginated<InvoiceDto>> {
    const { page, limit, search, status, billingPeriodId, roomId } = query;

    const where = {
        ...(status ? { status } : {}),
        ...(billingPeriodId ? { billingPeriodId } : {}),
        ...(roomId ? { roomId } : {}),
        ...(search
            ? {
                OR: [
                    { code: { contains: search, mode: "insensitive" as const } },
                    {
                        room: {
                            number: { contains: search, mode: "insensitive" as const },
                        },
                    },
                    {
                        tenant: {
                            fullName: { contains: search, mode: "insensitive" as const },
                        },
                    },
                    {
                        tenantName: { contains: search, mode: "insensitive" as const },
                    },
                ],
            }
            : {}),
    };

    const [total, invoices] = await Promise.all([
        db.invoice.count({ where }),
        db.invoice.findMany({
            where,
            include: invoiceInclude,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: invoices.map((i) => serializeInvoice(i as unknown as RawInvoice)),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getInvoiceById(id: string): Promise<InvoiceDto | null> {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: invoiceInclude,
    });
    return invoice ? serializeInvoice(invoice as unknown as RawInvoice) : null;
}

export async function getInvoiceByCode(code: string): Promise<InvoiceDto | null> {
    const invoice = await db.invoice.findUnique({
        where: { code },
        include: invoiceInclude,
    });
    return invoice ? serializeInvoice(invoice as unknown as RawInvoice) : null;
}

export async function listInvoicesByTenant(
    tenantId: string,
): Promise<InvoiceDto[]> {
    const invoices = await db.invoice.findMany({
        where: { tenantId },
        include: invoiceInclude,
        orderBy: { createdAt: "desc" },
    });
    return invoices.map((i) => serializeInvoice(i as unknown as RawInvoice));
}

export async function updateInvoice(
    id: string,
    input: UpdateInvoiceInput,
): Promise<InvoiceDto> {
    const invoice = await db.invoice.update({
        where: { id },
        data: {
            ...(input.status !== undefined && { status: input.status }),
            ...(input.note !== undefined && { note: input.note }),
        },
        include: invoiceInclude,
    });
    return serializeInvoice(invoice as unknown as RawInvoice);
}

export async function markInvoicePaid(
    id: string,
    input: MarkPaidInput,
): Promise<InvoiceDto> {
    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice) throw new DomainError(404, "Không tìm thấy hoá đơn");
    if (invoice.status === "PAID") {
        throw new DomainError(409, "Hoá đơn đã được thanh toán");
    }

    const amount = input.amount ?? decimalToNumber(invoice.totalAmount);

    await db.$transaction(async (tx) => {
        await tx.invoice.update({
            where: { id },
            data: {
                status: "PAID",
                paidAmount: amount,
                paidAt: new Date(),
            },
        });
        await tx.transferRecord.create({
            data: {
                invoiceId: id,
                amount,
                content: invoice.code,
                transferAt: new Date(),
                status: "MATCHED",
                source: "MANUAL",
                note: input.note ?? `Xác nhận thủ công (${input.method})`,
            },
        });
    });

    const updated = await db.invoice.findUnique({
        where: { id },
        include: invoiceInclude,
    });
    return serializeInvoice(updated as unknown as RawInvoice);
}

/**
 * Sửa từng dòng khoản phí của hoá đơn chưa thanh toán (ví dụ: miễn thang máy
 * khi sinh viên nghỉ hè) rồi tính lại tổng hoá đơn.
 */
export async function updateInvoiceItems(
    id: string,
    input: UpdateInvoiceItemsInput,
): Promise<InvoiceDto> {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: { items: true },
    });
    if (!invoice) throw new DomainError(404, "Không tìm thấy hoá đơn");
    if (invoice.status !== "DRAFT" && invoice.status !== "PENDING") {
        throw new DomainError(409, "Chỉ sửa được hoá đơn chưa thanh toán");
    }

    const itemById = new Map(invoice.items.map((item) => [item.id, item]));
    for (const patch of input.items) {
        if (!itemById.has(patch.id)) {
            throw new DomainError(422, "Dòng khoản phí không thuộc hoá đơn này");
        }
    }

    await db.$transaction(async (tx) => {
        for (const patch of input.items) {
            const item = itemById.get(patch.id)!;
            const quantity = patch.quantity ?? item.quantity;
            const unitPrice =
                patch.unitPrice ?? decimalToNumber(item.unitPrice);
            await tx.invoiceItem.update({
                where: { id: patch.id },
                data: {
                    quantity,
                    unitPrice,
                    total: quantity * unitPrice,
                },
            });
        }

        const items = await tx.invoiceItem.findMany({
            where: { invoiceId: id },
        });
        const totalAmount = items.reduce(
            (sum, item) => sum + decimalToNumber(item.total),
            0,
        );

        await tx.invoice.update({
            where: { id },
            data: {
                totalAmount,
                ...(input.note !== undefined && { note: input.note }),
            },
        });
    });

    const updated = await db.invoice.findUnique({
        where: { id },
        include: invoiceInclude,
    });
    return serializeInvoice(updated as unknown as RawInvoice);
}

// ------------------------------------------------------------
// Transfers & reconciliation (webhook)
// ------------------------------------------------------------

export interface WebhookTransfer {
    externalId: string;
    amount: number;
    content?: string | null;
    sourceAccount?: string | null;
    transferAt?: Date | null;
}

/** Đối soát một giao dịch chuyển khoản từ webhook vào hoá đơn. */
export async function reconcileTransfer(
    transfer: WebhookTransfer,
): Promise<TransferRecordDto> {
    return db.$transaction(async (tx) => {
        // Idempotency: không xử lý trùng externalId.
        if (transfer.externalId) {
            const existing = await tx.transferRecord.findUnique({
                where: { externalId: transfer.externalId },
                include: { invoice: true },
            });
            if (existing) {
                return serializeTransfer({
                    ...existing,
                    invoiceCode: existing.invoice?.code ?? null,
                });
            }
        }

        let status: "MATCHED" | "UNMATCHED" | "DUPLICATE" | "REVIEW" = "UNMATCHED";
        let invoiceId: string | null = null;

        const content = transfer.content?.trim();
        const invoice = content
            ? await tx.invoice.findUnique({ where: { code: content } })
            : null;

        if (invoice) {
            if (invoice.status === "PAID") {
                status = "DUPLICATE";
            } else if (transfer.amount >= decimalToNumber(invoice.totalAmount)) {
                status = "MATCHED";
                invoiceId = invoice.id;
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: {
                        status: "PAID",
                        paidAmount: invoice.totalAmount,
                        paidAt: transfer.transferAt ?? new Date(),
                    },
                });
            } else {
                // Thiếu tiền — giữ nguyên PENDING, đánh dấu cần xem xét.
                status = "REVIEW";
                invoiceId = invoice.id;
            }
        }

        const record = await tx.transferRecord.create({
            data: {
                externalId: transfer.externalId,
                invoiceId,
                amount: transfer.amount,
                content: transfer.content ?? null,
                sourceAccount: transfer.sourceAccount ?? null,
                transferAt: transfer.transferAt ?? new Date(),
                status,
                source: "WEBHOOK",
            },
        });

        return serializeTransfer({ ...record, invoiceCode: invoice?.code ?? null });
    });
}

function serializeTransfer(record: {
    id: string;
    invoiceId: string | null;
    invoiceCode: string | null;
    amount: unknown;
    content: string | null;
    sourceAccount: string | null;
    transferAt: Date | null;
    status: "MATCHED" | "UNMATCHED" | "DUPLICATE" | "REVIEW";
    source: "WEBHOOK" | "MANUAL";
    createdAt: Date;
}): TransferRecordDto {
    return {
        id: record.id,
        invoiceId: record.invoiceId,
        invoiceCode: record.invoiceCode,
        amount: decimalToNumber(record.amount),
        content: record.content,
        sourceAccount: record.sourceAccount,
        transferAt: serializeDate(record.transferAt),
        status: record.status,
        source: record.source,
        createdAt:
            serializeDate(record.createdAt) ?? record.createdAt.toISOString(),
    };
}

export async function listTransfers(
    query: TransferQuery,
): Promise<Paginated<TransferRecordDto>> {
    const { page, limit, status } = query;

    const where = status ? { status } : {};

    const [total, records] = await Promise.all([
        db.transferRecord.count({ where }),
        db.transferRecord.findMany({
            where,
            include: { invoice: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: records.map((r) =>
            serializeTransfer({
                ...r,
                invoiceCode: r.invoice?.code ?? null,
            }),
        ),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export { type InvoiceItemDto };
