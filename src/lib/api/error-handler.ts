import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/errors";
import { DomainError } from "./errors";
import { fail } from "./response";

interface PrismaErrorLike {
    code?: string;
}

/**
 * Xử lý lỗi tập trung cho mọi route handler.
 * Trả về NextResponse với message thân thiện và status phù hợp.
 */
export function handleApiError(error: unknown) {
    if (error instanceof AuthError || error instanceof DomainError) {
        return fail(error.message, error.status);
    }

    if (error instanceof ZodError) {
        return fail("Dữ liệu không hợp lệ", 422, error.flatten().fieldErrors);
    }

    const code = (error as PrismaErrorLike)?.code;
    if (code === "P2002") {
        return fail("Bản ghi đã tồn tại (trùng mã hoặc trường duy nhất)", 409);
    }
    if (code === "P2025") {
        return fail("Không tìm thấy bản ghi", 404);
    }

    console.error("[API Error]", error);
    return fail("Lỗi máy chủ nội bộ", 500);
}
