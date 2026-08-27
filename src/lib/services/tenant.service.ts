import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { serializeDate } from "@/lib/serializers";
import { DomainError } from "@/lib/api/errors";
import type {
    CreateTenantInput,
    ResetPasswordInput,
    TenantQuery,
    UpdateTenantInput,
} from "@/lib/validation/tenant";
import type { Paginated, TenantDto } from "@/types";

const tenantInclude = {
    user: true,
    leases: { where: { status: "ACTIVE" as const }, take: 1, include: { room: true } },
} as const;

type RawTenant = {
    id: string;
    userId: string;
    fullName: string;
    phone: string | null;
    idCard: string | null;
    note: string | null;
    createdAt: Date;
    user: { username: string; isActive: boolean };
    leases: Array<{ id: string; room: { number: string } }>;
};

function serializeTenant(tenant: RawTenant): TenantDto {
    return {
        id: tenant.id,
        userId: tenant.userId,
        fullName: tenant.fullName,
        phone: tenant.phone,
        idCard: tenant.idCard,
        note: tenant.note,
        username: tenant.user.username,
        isActive: tenant.user.isActive,
        activeRoom: tenant.leases[0]?.room.number ?? null,
        activeLeaseId: tenant.leases[0]?.id ?? null,
        createdAt:
            serializeDate(tenant.createdAt) ?? tenant.createdAt.toISOString(),
    };
}

export async function listTenants(
    query: TenantQuery,
): Promise<Paginated<TenantDto>> {
    const { page, limit, search } = query;

    const where = {
        ...(search
            ? {
                OR: [
                    { fullName: { contains: search, mode: "insensitive" as const } },
                    { phone: { contains: search } },
                    { user: { username: { contains: search, mode: "insensitive" as const } } },
                ],
            }
            : {}),
        ...(query.status
            ? { user: { isActive: query.status === "active" } }
            : {}),
    };

    const [total, tenants] = await Promise.all([
        db.tenant.count({ where }),
        db.tenant.findMany({
            where,
            include: tenantInclude,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    return {
        data: tenants.map((t) => serializeTenant(t as unknown as RawTenant)),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function listAllTenants(): Promise<TenantDto[]> {
    const tenants = await db.tenant.findMany({
        include: tenantInclude,
        orderBy: { fullName: "asc" },
    });
    return tenants.map((t) => serializeTenant(t as unknown as RawTenant));
}

export async function getTenantById(id: string): Promise<TenantDto | null> {
    const tenant = await db.tenant.findUnique({
        where: { id },
        include: tenantInclude,
    });
    return tenant ? serializeTenant(tenant as unknown as RawTenant) : null;
}

/** Tạo người thuê kèm tài khoản đăng nhập (tên đăng nhập + mật khẩu). */
export async function createTenant(
    input: CreateTenantInput,
): Promise<TenantDto> {
    const username = input.username.trim();

    // Username chỉ cần duy nhất trong số tài khoản ĐANG hoạt động
    // (tài khoản đã khoá — người đã chuyển đi — có thể dùng lại username cũ).
    const conflict = await db.user.findFirst({
        where: {
            username: { equals: username, mode: "insensitive" },
            isActive: true,
        },
    });
    if (conflict) {
        throw new DomainError(
            409,
            "Tên đăng nhập đã được sử dụng bởi tài khoản đang hoạt động.",
        );
    }

    const passwordHash = await hashPassword(input.password);

    const tenant = await db.tenant.create({
        data: {
            fullName: input.fullName,
            phone: input.phone ?? null,
            idCard: input.idCard ?? null,
            note: input.note ?? null,
            user: {
                create: {
                    username,
                    passwordHash,
                    name: input.fullName,
                    role: "TENANT",
                    mustChangePassword: true,
                },
            },
        },
        include: tenantInclude,
    });

    return serializeTenant(tenant as unknown as RawTenant);
}

export async function updateTenant(
    id: string,
    input: UpdateTenantInput,
): Promise<TenantDto> {
    const tenant = await db.tenant.update({
        where: { id },
        data: {
            ...(input.fullName !== undefined && { fullName: input.fullName }),
            ...(input.phone !== undefined && { phone: input.phone }),
            ...(input.idCard !== undefined && { idCard: input.idCard }),
            ...(input.note !== undefined && { note: input.note }),
            ...(input.isActive !== undefined && {
                user: { update: { isActive: input.isActive } },
            }),
        },
        include: tenantInclude,
    });
    return serializeTenant(tenant as unknown as RawTenant);
}

/** Đặt lại mật khẩu cho người thuê (admin thao tác). */
export async function resetTenantPassword(
    id: string,
    input: ResetPasswordInput,
): Promise<TenantDto> {
    const tenant = await db.tenant.update({
        where: { id },
        data: {
            user: {
                update: {
                    passwordHash: await hashPassword(input.password),
                    mustChangePassword: true,
                    failedAttempts: 0,
                    lockedUntil: null,
                },
            },
        },
        include: tenantInclude,
    });
    return serializeTenant(tenant as unknown as RawTenant);
}

/**
 * Xoá người thuê + tài khoản đăng nhập. Chỉ cho phép khi chưa có hợp đồng/hoá đơn
 * (để giữ lịch sử truy vết); người đã có lịch sử thì hãy vô hiệu hoá thay vì xoá.
 */
export async function deleteTenant(id: string): Promise<void> {
    const tenant = await db.tenant.findUnique({
        where: { id },
        select: { id: true, userId: true },
    });
    if (!tenant) throw new DomainError(404, "Không tìm thấy người thuê");

    const [leaseCount, invoiceCount] = await Promise.all([
        db.lease.count({ where: { tenantId: id } }),
        db.invoice.count({ where: { tenantId: id } }),
    ]);
    if (leaseCount > 0 || invoiceCount > 0) {
        throw new DomainError(
            409,
            "Không thể xoá người thuê đã có hợp đồng hoặc hoá đơn. Hãy vô hiệu hoá tài khoản thay vì xoá để giữ lịch sử.",
        );
    }

    // Xoá User sẽ cascade xoá Tenant (schema: Tenant.user onDelete Cascade)
    // → không để lại tài khoản mồ côi.
    await db.user.delete({ where: { id: tenant.userId } });
}

export async function getTenantByUserId(userId: string) {
    return db.tenant.findUnique({ where: { userId } });
}

/** Lấy thông tin người thuê (kèm phòng đang ở) theo userId, dạng DTO. */
export async function getTenantDtoByUserId(
    userId: string,
): Promise<TenantDto | null> {
    const tenant = await db.tenant.findUnique({
        where: { userId },
        include: tenantInclude,
    });
    return tenant ? serializeTenant(tenant as unknown as RawTenant) : null;
}
