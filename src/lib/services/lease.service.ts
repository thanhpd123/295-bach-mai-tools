import { db } from "@/lib/db";
import { DomainError } from "@/lib/api/errors";
import { decimalToNumber, serializeDate } from "@/lib/serializers";
import type {
    CreateLeaseInput,
    EndLeaseInput,
    LeaseQuery,
} from "@/lib/validation/lease";
import type { LeaseDto, Paginated } from "@/types";

const leaseInclude = {
    room: true,
    tenant: true,
} as const;

type RawLease = {
    id: string;
    roomId: string;
    tenantId: string;
    startDate: Date;
    endDate: Date | null;
    status: "ACTIVE" | "ENDED";
    peopleCount: number;
    motorcycleCount: number;
    deposit: unknown;
    room: { number: string };
    tenant: { fullName: string };
};

function serializeLease(lease: RawLease): LeaseDto {
    return {
        id: lease.id,
        roomId: lease.roomId,
        roomNumber: lease.room.number,
        tenantId: lease.tenantId,
        tenantName: lease.tenant.fullName,
        startDate:
            serializeDate(lease.startDate) ?? lease.startDate.toISOString(),
        endDate: serializeDate(lease.endDate),
        status: lease.status,
        peopleCount: lease.peopleCount,
        motorcycleCount: lease.motorcycleCount,
        deposit: decimalToNumber(lease.deposit),
    };
}

export async function listLeases(query: LeaseQuery): Promise<Paginated<LeaseDto>> {
    const { page, limit, roomId, tenantId, status } = query;

    const where = {
        ...(roomId ? { roomId } : {}),
        ...(tenantId ? { tenantId } : {}),
        ...(status ? { status } : {}),
    };

    const [total, leases] = await Promise.all([
        db.lease.count({ where }),
        db.lease.findMany({
            where,
            include: leaseInclude,
            orderBy: { startDate: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: leases.map((l) => serializeLease(l as unknown as RawLease)),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

/** Người thuê chuyển vào phòng → tạo hợp đồng + đánh dấu phòng OCCUPIED. */
export async function createLease(input: CreateLeaseInput): Promise<LeaseDto> {
    const room = await db.room.findUnique({ where: { id: input.roomId } });
    if (!room) throw new DomainError(404, "Không tìm thấy phòng");
    if (room.status === "OCCUPIED") {
        throw new DomainError(409, "Phòng này đang có người thuê");
    }

    const lease = await db.$transaction(async (tx) => {
        const created = await tx.lease.create({
            data: {
                roomId: input.roomId,
                tenantId: input.tenantId,
                startDate: input.startDate,
                peopleCount: input.peopleCount,
                motorcycleCount: input.motorcycleCount,
                deposit: input.deposit,
            },
            include: leaseInclude,
        });
        await tx.room.update({
            where: { id: input.roomId },
            data: { status: "OCCUPIED" },
        });
        // Tái kích hoạt tài khoản nếu người thuê quay lại (đã bị khoá khi chuyển đi).
        const tenant = await tx.tenant.findUnique({
            where: { id: input.tenantId },
            select: { userId: true },
        });
        if (tenant) {
            await tx.user.update({
                where: { id: tenant.userId },
                data: { isActive: true },
            });
        }
        return created;
    });

    return serializeLease(lease as unknown as RawLease);
}

/** Kết thúc hợp đồng (chuyển đi) → phòng về VACANT. */
export async function endLease(
    id: string,
    input: EndLeaseInput,
): Promise<LeaseDto> {
    const lease = await db.$transaction(async (tx) => {
        const existing = await tx.lease.findUnique({ where: { id } });
        if (!existing) throw new DomainError(404, "Không tìm thấy hợp đồng");

        const updated = await tx.lease.update({
            where: { id },
            data: { status: "ENDED", endDate: input.endDate },
            include: leaseInclude,
        });

        // Chỉ chuyển phòng về trống nếu không còn hợp đồng ACTIVE nào khác.
        const otherActive = await tx.lease.count({
            where: { roomId: existing.roomId, status: "ACTIVE", id: { not: id } },
        });
        if (otherActive === 0) {
            await tx.room.update({
                where: { id: existing.roomId },
                data: { status: "VACANT" },
            });
        }

        // Khoá tài khoản nếu người thuê không còn hợp đồng ACTIVE nào khác.
        const otherTenantLease = await tx.lease.count({
            where: { tenantId: existing.tenantId, status: "ACTIVE", id: { not: id } },
        });
        if (otherTenantLease === 0) {
            const tenant = await tx.tenant.findUnique({
                where: { id: existing.tenantId },
                select: { userId: true },
            });
            if (tenant) {
                await tx.user.update({
                    where: { id: tenant.userId },
                    data: { isActive: false },
                });
            }
        }
        return updated;
    });

    return serializeLease(lease as unknown as RawLease);
}

export async function getActiveLeaseByRoom(roomId: string) {
    return db.lease.findFirst({
        where: { roomId, status: "ACTIVE" },
        include: { tenant: { include: { user: true } }, room: true },
    });
}

export async function getActiveLeaseByTenant(tenantId: string) {
    return db.lease.findFirst({
        where: { tenantId, status: "ACTIVE" },
        include: { room: true, tenant: true },
    });
}
