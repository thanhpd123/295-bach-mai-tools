/**
 * Cấu hình chung của ứng dụng — nơi tập trung các hằng số,
 * tên app, đường dẫn menu... để dễ bảo trì.
 */

export const siteConfig = {
    name: "Quản lý phòng trọ",
    shortName: "QLPT",
    description:
        "Hệ thống quản lý phòng trọ và thu tiền điện nước hàng tháng",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export interface NavItem {
    title: string;
    href: string;
}

/** Menu chính trong sidebar của dashboard (chủ nhà/quản lý). */
export const navItems: NavItem[] = [
    { title: "Tổng quan", href: "/dashboard" },
    { title: "Phòng", href: "/dashboard/rooms" },
    { title: "Người thuê", href: "/dashboard/tenants" },
    { title: "Kỳ & Chỉ số", href: "/dashboard/billing" },
    { title: "Hoá đơn", href: "/dashboard/invoices" },
    { title: "Giao dịch", href: "/dashboard/transfers" },
    { title: "Cài đặt", href: "/dashboard/settings" },
    { title: "Sức khoẻ hệ thống", href: "/dashboard/health" },
];
