"use client";

import { useEffect } from "react";

/** Đăng ký service worker để hỗ trợ cài đặt PWA. */
export function PwaRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {
                // Không chặn trải nghiệm nếu đăng ký thất bại.
            });
        }
    }, []);

    return null;
}
