import type { Metadata } from "next";
import { HealthPanel } from "@/components/admin/health-panel";

export const metadata: Metadata = { title: "Sức khoẻ hệ thống" };

export default function HealthPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Sức khoẻ hệ thống
                </h1>
                <p className="text-sm text-slate-500">
                    Trạng thái database, webhook ngân hàng và nhật ký gần đây.
                </p>
            </div>
            <HealthPanel />
        </div>
    );
}
