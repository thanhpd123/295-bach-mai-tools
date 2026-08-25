import { NextResponse } from "next/server";

/**
 * Chuẩn hoá format phản hồi API:
 *   { success: true,  data: ... }
 *   { success: false, error: { message, details? } }
 */

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json({ success: true, data }, init);
}

export function fail(
    message: string,
    status: number = 400,
    details?: unknown,
) {
    return NextResponse.json(
        { success: false, error: { message, details } },
        { status },
    );
}
