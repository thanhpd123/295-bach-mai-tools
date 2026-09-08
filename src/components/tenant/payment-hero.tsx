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
        ? "border-emerald-400/20 bg-emerald-400/10"
        : isOverdue
            ? "border-rose-400/20 bg-rose-400/10"
            : "border-cyan-400/20 bg-cyan-400/10";

    const amountTone = isPaid
        ? "text-emerald-300"
        : isOverdue
            ? "text-rose-300"
            : "text-cyan-300";

    return (
        <div className={cn("rounded-2xl border p-5 shadow-sm", tone)}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
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

            <div className="mt-2 text-sm text-slate-300">
                {isPaid ? (
                    <>
                        Hoá đơn {invoice.code} · Kỳ {invoice.billingPeriodCode}
                    </>
                ) : (
                    <>
                        Hạn thanh toán:{" "}
                        <strong className="text-white">
                            {formatDate(invoice.dueDate)}
                        </strong>
                        {isOverdue && days > 0 && (
                            <span className="ml-2 font-semibold text-rose-300">
                                · Quá hạn {days} ngày
                            </span>
                        )}
                    </>
                )}
            </div>

            {!isPaid && invoice.status !== "CANCELLED" && (
                <a
                    href="#payment"
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-600 to-cyan-500 px-6 text-base font-semibold text-white shadow-[0_0_18px_rgba(34,211,238,0.18)] transition-all hover:brightness-110"
                >
                    Thanh toán ngay
                </a>
            )}
        </div>
    );
}
