import type { Metadata } from "next";
import { TransfersList } from "@/components/admin/transfers-list";

export const metadata: Metadata = { title: "Giao dịch" };

export default function TransfersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Giao dịch chuyển khoản
                </h1>
                <p className="text-sm text-slate-400">
                    Ai chuyển tiền, lúc nào, khớp với hoá đơn nào.
                </p>
            </div>
            <TransfersList />
        </div>
    );
}
