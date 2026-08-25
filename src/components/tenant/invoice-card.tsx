import { Badge } from "@/components/ui/badge";
import { buildVietQrImageUrl } from "@/lib/vietqr";
import { invoiceStatusLabels } from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BankAccountDto, InvoiceDto } from "@/types";

const statusVariant = {
    PAID: "success",
    PENDING: "warning",
    OVERDUE: "danger",
    DRAFT: "neutral",
    CANCELLED: "danger",
} as const;

/** Hiển thị hoá đơn chi tiết kèm mã QR thanh toán VietQR. */
export function InvoiceCard({
    invoice,
    bankAccount,
}: {
    invoice: InvoiceDto;
    bankAccount: BankAccountDto | null;
}) {
    const remaining = invoice.totalAmount - invoice.paidAmount;

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                            Hoá đơn
                        </div>
                        <div className="text-lg font-bold text-slate-900">{invoice.code}</div>
                    </div>
                    <Badge variant={statusVariant[invoice.status]}>
                        {invoiceStatusLabels[invoice.status]}
                    </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-slate-500">Phòng:</span>{" "}
                        <strong>{invoice.roomNumber}</strong>
                    </div>
                    <div>
                        <span className="text-slate-500">Kỳ:</span>{" "}
                        <strong>{invoice.billingPeriodCode}</strong>
                    </div>
                    <div>
                        <span className="text-slate-500">Hạn thanh toán:</span>{" "}
                        <strong>{formatDate(invoice.dueDate)}</strong>
                    </div>
                </div>

                {/* Các khoản phí */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                    {invoice.items.map((item) => (
                        <div key={item.id} className="flex justify-between py-1 text-sm">
                            <span className="text-slate-600">
                                {item.description} {item.quantity > 1 ? `× ${item.quantity}` : ""}
                            </span>
                            <span className="tabular-nums text-slate-800">
                                {formatCurrency(item.total)}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-blue-700">
                            {formatCurrency(invoice.totalAmount)}
                        </span>
                    </div>
                    {invoice.status === "PAID" && (
                        <div className="mt-1 text-right text-sm text-emerald-600">
                            Đã thanh toán {formatCurrency(invoice.paidAmount)}
                            {invoice.paidAt ? ` · ${formatDate(invoice.paidAt)}` : ""}
                        </div>
                    )}
                </div>
            </div>

            {/* QR thanh toán */}
            {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 font-semibold text-slate-900">
                        Thanh toán bằng chuyển khoản
                    </h2>

                    {bankAccount ? (
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={buildVietQrImageUrl(
                                    bankAccount,
                                    remaining > 0 ? remaining : invoice.totalAmount,
                                    invoice.code,
                                )}
                                alt={`Mã QR thanh toán ${invoice.code}`}
                                className="size-48 rounded-lg border border-slate-200"
                            />
                            <div className="flex-1 space-y-2 text-sm">
                                <p>
                                    <span className="text-slate-500">Ngân hàng:</span>{" "}
                                    <strong>{bankAccount.bankName}</strong>
                                </p>
                                <p>
                                    <span className="text-slate-500">Số tài khoản:</span>{" "}
                                    <strong className="break-all">
                                        {bankAccount.accountNumber}
                                    </strong>
                                </p>
                                <p>
                                    <span className="text-slate-500">Chủ tài khoản:</span>{" "}
                                    <strong>{bankAccount.accountName}</strong>
                                </p>
                                <p>
                                    <span className="text-slate-500">Số tiền:</span>{" "}
                                    <strong>
                                        {formatCurrency(
                                            remaining > 0 ? remaining : invoice.totalAmount,
                                        )}
                                    </strong>
                                </p>
                                <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                                    ⚠️ Nội dung chuyển khoản ghi đúng:{" "}
                                    <strong className="break-all">{invoice.code}</strong>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Chủ nhà chưa cài đặt tài khoản nhận tiền. Vui lòng liên hệ để biết
                            thông tin chuyển khoản.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
