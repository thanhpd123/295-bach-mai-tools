import { fail } from "@/lib/api/response";

/** API cũ của app phòng khám đã ngừng hoạt động. */
export const dynamic = "force-dynamic";

export async function GET() {
    return fail("API này đã được thay bằng /api/invoices/:id", 410);
}

export async function PATCH() {
    return fail("API này đã được thay bằng /api/invoices/:id", 410);
}

export async function DELETE() {
    return fail("API này đã được thay bằng /api/invoices/:id", 410);
}
