import type { Metadata } from "next";
import { PaymentsList } from "@/components/payments/payments-list";

export const metadata: Metadata = {
    title: "Danh sách thanh toán",
};

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Thanh toán
                </h1>
                <p className="text-sm text-slate-500">
                    Quản lý các phiếu thu của phòng khám.
                </p>
            </div>
            <PaymentsList />
        </div>
    );
}
