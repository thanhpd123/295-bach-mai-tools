import { redirect } from "next/navigation";

/** Trang cũ của app phòng khám — chuyển sang quản lý hoá đơn. */
export default function PaymentsPage() {
    redirect("/dashboard/invoices");
}
