import type { Metadata } from "next";
import { InvoicesList } from "@/components/admin/invoices-list";

export const metadata: Metadata = { title: "Hoá đơn" };

export default function InvoicesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Hoá đơn
                </h1>
                <p className="text-sm text-slate-400">
                    Theo dõi và xác nhận thanh toán các hoá đơn hằng tháng.
                </p>
            </div>
            <InvoicesList />
        </div>
    );
}
