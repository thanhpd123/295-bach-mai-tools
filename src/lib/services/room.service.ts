import { db } from "@/lib/db";
import { decimalToNumber, serializeDate } from "@/lib/serializers";
import type { RoomQuery, UpdateRoomInput } from "@/lib/validation/room";
import type { Paginated, RoomDto } from "@/types";

type RoomStatusValue = "VACANT" | "OCCUPIED" | "MAINTENANCE";

const activeLeaseInclude = {
    leases: {
        where: { status: "ACTIVE" as const },
        include: { tenant: true },
        take: 1,
    },
} as const;

type RawRoom = {
    id: string;
    number: string;
    floor: number;
    baseRent: unknown;
    status: RoomStatusValue;
    isActive: boolean;
    createdAt: Date;
    leases: Array<{
        peopleCount: number;
        motorcycleCount: number;
        tenant: { fullName: string; phone: string | null };
    }>;
};

function serializeRoom(room: RawRoom): RoomDto {
    const lease = room.leases[0];
    return {
        id: room.id,
        number: room.number,
        floor: room.floor,
        baseRent: decimalToNumber(room.baseRent),
        status: room.status,
        isActive: room.isActive,
        tenantName: lease?.tenant.fullName ?? null,
        tenantPhone: lease?.tenant.phone ?? null,
        peopleCount: lease?.peopleCount ?? 0,
        motorcycleCount: lease?.motorcycleCount ?? 0,
        createdAt:
            serializeDate(room.createdAt) ?? room.createdAt.toISOString(),
    };
}

export async function listRooms(query: RoomQuery): Promise<Paginated<RoomDto>> {
    const { page, limit, search, status, floor } = query;

    const where = {
        ...(status ? { status } : {}),
        ...(floor ? { floor } : {}),
        ...(search ? { number: { contains: search } } : {}),
    };

    const [total, rooms] = await Promise.all([
        db.room.count({ where }),
        db.room.findMany({
            where,
            include: activeLeaseInclude,
            orderBy: [{ floor: "asc" }, { number: "asc" }],
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: rooms.map((room) => serializeRoom(room as unknown as RawRoom)),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function listAllRooms(): Promise<RoomDto[]> {
    const rooms = await db.room.findMany({
        where: { isActive: true },
        include: activeLeaseInclude,
        orderBy: [{ floor: "asc" }, { number: "asc" }],
    });
    return rooms.map((room) => serializeRoom(room as unknown as RawRoom));
}

export async function updateRoom(
    id: string,
    input: UpdateRoomInput,
): Promise<RoomDto> {
    const room = await db.room.update({
        where: { id },
        data: input,
        include: activeLeaseInclude,
    });
    return serializeRoom(room as unknown as RawRoom);
}

export async function getRoomByNumber(number: string) {
    return db.room.findUnique({ where: { number } });
}
