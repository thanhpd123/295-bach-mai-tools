/**
 * Chuyển đổi dữ liệu Prisma (Decimal, Date) sang dạng JSON an toàn
 * để trả về cho client (JSON không lưu được object Decimal/Date).
 */

/** Prisma.Decimal → number */
export function decimalToNumber(value: unknown): number {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);

    const obj = value as { toNumber?: unknown; toString?: unknown };
    if (typeof obj.toNumber === "function") {
        return (obj as { toNumber(): number }).toNumber();
    }
    if (typeof obj.toString === "function") {
        return Number((obj as { toString(): string }).toString());
    }
    return Number(value);
}

/** Date → ISO string (null-safe) */
export function serializeDate(
    value: Date | string | number | null | undefined,
): string | null {
    if (value == null) return null;
    return new Date(value).toISOString();
}
