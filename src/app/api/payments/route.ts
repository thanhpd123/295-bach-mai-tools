import { fail } from "@/lib/api/response";

/** API cũ của app phòng khám đã ngừng hoạt động. */
export const dynamic = "force-dynamic";

export async function GET() {
    return fail("API này đã được thay bằng /api/invoices", 410);
}

export async function POST() {
    return fail("API này đã được thay bằng /api/invoices", 410);
}
