import type { Metadata } from "next";
import { SettingsPanel } from "@/components/admin/settings-panel";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Cài đặt
                </h1>
                <p className="text-sm text-slate-400">
                    Tài khoản ngân hàng nhận tiền và đơn giá điện/nước/phí.
                </p>
            </div>
            <SettingsPanel />
        </div>
    );
}
