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

/** Một dòng hoá đơn dạng thẻ. Bấm mở chi tiết tức thì (không tải lại trang). */
export function InvoiceListItem({
    invoice,
    onOpen,
}: {
    invoice: InvoiceDto;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">
                        {invoice.code}
                    </span>
                    <Badge variant={statusVariant[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                    </Badge>
                </div>
                <div className="mt-1 text-sm text-slate-400">
                    Kỳ {invoice.billingPeriodCode} · Hạn{" "}
                    {formatDate(invoice.dueDate)}
                </div>
            </div>
            <div className="shrink-0 text-right">
                <div className="font-semibold tabular-nums text-white">
                    {formatCurrency(invoice.totalAmount)}
                </div>
                {invoice.status === "OVERDUE" && (
                    <div className="text-xs font-medium text-rose-300">
                        Quá hạn
                    </div>
                )}
            </div>
            <ChevronRight className="size-5 shrink-0 text-slate-600" />
        </button>
    );
}
