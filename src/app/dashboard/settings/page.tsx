import type { Metadata } from "next";
import { SettingsPanel } from "@/components/admin/settings-panel";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Cài đặt
                </h1>
                <p className="text-sm text-slate-500">
                    Tài khoản ngân hàng nhận tiền và đơn giá điện/nước/phí.
                </p>
            </div>
            <SettingsPanel />
        </div>
    );
}
