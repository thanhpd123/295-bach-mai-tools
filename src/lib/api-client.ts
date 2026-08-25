import type { ApiError, ApiSuccess } from "@/types";

/**
 * Client API helper — gọi API nội bộ từ phía client (browser).
 * Tự động parse JSON và throw Error với message thân thiện.
 */

export async function apiFetch<T>(
    url: string,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    const json = (await response.json()) as ApiSuccess<T> | ApiError;

    if (!response.ok || !("success" in json) || !json.success) {
        const message =
            "error" in json ? json.error.message : `Yêu cầu thất bại (${response.status})`;
        throw new Error(message);
    }

    return json.data;
}
