"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Đăng xuất
        </Button>
    );
}
