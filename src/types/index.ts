import type {
    FeeType,
    InvoiceStatus,
    LeaseStatus,
    RoomStatus,
    TransferStatus,
    UserRole,
} from "@/generated/prisma/enums";

/**
 * DTO (Data Transfer Object) — dữ liệu đã được serialize để trả về client.
 * Decimal → number, Date → ISO string.
 */

// ----- Auth -----
export interface SessionUser {
    id: string;
    role: UserRole;
    name: string;
}

export interface LoginResult {
    user: SessionUser & { mustChangePassword: boolean };
    redirectTo: string;
}

// ----- User / Tenant -----
export interface UserDto {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: string;
}

export interface TenantDto {
    id: string;
    userId: string;
    fullName: string;
    phone: string | null;
    idCard: string | null;
    note: string | null;
    username: string;
    isActive: boolean;
    activeRoom: string | null;
    createdAt: string;
}

// ----- Room / Lease -----
export interface RoomDto {
    id: string;
    number: string;
    floor: number;
    baseRent: number;
    status: RoomStatus;
    isActive: boolean;
    tenantName: string | null;
    tenantPhone: string | null;
    peopleCount: number;
    motorcycleCount: number;
    createdAt: string;
}

export interface LeaseDto {
    id: string;
    roomId: string;
    roomNumber: string;
    tenantId: string;
    tenantName: string;
    startDate: string;
    endDate: string | null;
    status: LeaseStatus;
    peopleCount: number;
    motorcycleCount: number;
    deposit: number;
}

// ----- Billing -----
export interface BillingPeriodDto {
    id: string;
    code: string;
    month: number;
    year: number;
    startDate: string;
    endDate: string;
    dueDate: string;
    status: "OPEN" | "CLOSED";
    createdAt: string;
}

export interface MeterReadingDto {
    id: string;
    roomId: string;
    roomNumber: string;
    billingPeriodId: string;
    electricityOld: number;
    electricityNew: number;
    waterOld: number;
    waterNew: number;
    electricityUsage: number;
    waterUsage: number;
    peopleCount: number;
    motorcycleCount: number;
}

export interface InvoiceItemDto {
    id: string;
    feeType: FeeType;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface InvoiceDto {
    id: string;
    code: string;
    roomId: string;
    roomNumber: string;
    billingPeriodId: string;
    billingPeriodCode: string;
    tenantId: string | null;
    tenantName: string | null;
    status: InvoiceStatus;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    note: string | null;
    paidAt: string | null;
    createdAt: string;
    items: InvoiceItemDto[];
}

export interface BankAccountDto {
    id: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isActive: boolean;
}

export interface TransferRecordDto {
    id: string;
    invoiceId: string | null;
    invoiceCode: string | null;
    amount: number;
    content: string | null;
    sourceAccount: string | null;
    transferAt: string | null;
    status: TransferStatus;
    source: "WEBHOOK" | "MANUAL";
    createdAt: string;
}

// ----- Tenant portal -----
export interface TenantHomeDto {
    roomNumber: string;
    floor: number;
    invoice: InvoiceDto | null;
    meterReading: MeterReadingDto | null;
    dueDate: string | null;
    bankAccount: BankAccountDto | null;
}

// ----- Dashboard -----
export interface DashboardStatsDto {
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    maintenanceRooms: number;
    pendingInvoices: number;
    overdueInvoices: number;
    monthRevenue: number;
    monthCollected: number;
    monthOutstanding: number;
    currentPeriodCode: string | null;
    currentPeriodDueDate: string | null;
}

export interface HealthDto {
    status: "ok" | "degraded";
    database: "ok" | "error";
    databaseLatencyMs: number;
    service: string;
    timestamp: string;
    lastWebhookAt: string | null;
    unmatchedTransfers: number;
    failedLogins24h: number;
}

// ----- Pagination & API envelope -----
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
