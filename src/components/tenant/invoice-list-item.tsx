import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { invoiceStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDto } from "@/types";

const statusVariant = {
    PAID: "success",
    PENDING: "warning",
    OVERDUE: "danger",
    DRAFT: "neutral",
    CANCELLED: "danger",
} as const;

/** Một dòng hoá đơn dạng thẻ (thay thế bảng trên màn hình nhỏ). */
export function InvoiceListItem({ invoice }: { invoice: InvoiceDto }) {
    return (
        <Link
            href={`/app/invoices/${invoice.id}`}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-slate-50"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900">
                        {invoice.code}
                    </span>
                    <Badge variant={statusVariant[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                    </Badge>
                </div>
                <div className="mt-1 text-sm text-slate-500">
                    Kỳ {invoice.billingPeriodCode} · Hạn{" "}
                    {formatDate(invoice.dueDate)}
                </div>
            </div>
            <div className="shrink-0 text-right">
                <div className="font-semibold tabular-nums text-slate-900">
                    {formatCurrency(invoice.totalAmount)}
                </div>
                {invoice.status === "OVERDUE" && (
                    <div className="text-xs font-medium text-red-600">
                        Quá hạn
                    </div>
                )}
            </div>
            <ChevronRight className="size-5 shrink-0 text-slate-300" />
        </Link>
    );
}
