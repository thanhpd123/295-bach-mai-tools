import { Badge } from "@/components/ui/badge";
import { invoiceStatusLabels } from "@/lib/labels";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceDto } from "@/types";

const statusVariant = {
    PAID: "success",
    PENDING: "warning",
    OVERDUE: "danger",
    DRAFT: "neutral",
    CANCELLED: "danger",
} as const;

function overdueDays(dueDate: string): number {
    const due = new Date(dueDate).getTime();
    const today = new Date().getTime();
    return Math.floor((today - due) / 86_400_000);
}

/**
 * Khối nổi bật nhất của trang chủ người thuê:
 * số tiền cần thanh toán, hạn, trạng thái và nút thanh toán ngay.
 */
export function PaymentHero({ invoice }: { invoice: InvoiceDto }) {
    const remaining = invoice.totalAmount - invoice.paidAmount;
    const isPaid = invoice.status === "PAID";
    const isOverdue = invoice.status === "OVERDUE";
    const days = overdueDays(invoice.dueDate);

    const tone = isPaid
        ? "border-emerald-200 bg-emerald-50"
        : isOverdue
            ? "border-red-200 bg-red-50"
            : "border-blue-200 bg-blue-50";

    const amountTone = isPaid
        ? "text-emerald-700"
        : isOverdue
            ? "text-red-700"
            : "text-blue-700";

    return (
        <div className={cn("rounded-2xl border p-5 shadow-sm", tone)}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {isPaid ? "Đã thanh toán" : "Số tiền cần thanh toán"}
                    </div>
                    <div
                        className={cn(
                            "mt-1 text-3xl font-extrabold tabular-nums",
                            amountTone,
                        )}
                    >
                        {formatCurrency(isPaid ? invoice.paidAmount : remaining)}
                    </div>
                </div>
                <Badge variant={statusVariant[invoice.status]}>
                    {invoiceStatusLabels[invoice.status]}
                </Badge>
            </div>

            <div className="mt-2 text-sm text-slate-600">
                {isPaid ? (
                    <>
                        Hoá đơn {invoice.code} · Kỳ {invoice.billingPeriodCode}
                    </>
                ) : (
                    <>
                        Hạn thanh toán:{" "}
                        <strong className="text-slate-800">
                            {formatDate(invoice.dueDate)}
                        </strong>
                        {isOverdue && days > 0 && (
                            <span className="ml-2 font-semibold text-red-700">
                                · Quá hạn {days} ngày
                            </span>
                        )}
                    </>
                )}
            </div>

            {!isPaid && invoice.status !== "CANCELLED" && (
                <a
                    href="#payment"
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
                >
                    Thanh toán ngay
                </a>
            )}
        </div>
    );
}
