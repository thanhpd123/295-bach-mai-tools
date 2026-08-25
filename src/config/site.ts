/**
 * Cấu hình chung của ứng dụng — nơi tập trung các hằng số,
 * tên app, đường dẫn menu... để dễ bảo trì.
 */

export const siteConfig = {
    name: "295 Bạch Mai Tools",
    shortName: "295BM",
    description: "Hệ thống quản lý thanh toán phòng khám 295 Bạch Mai",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    github: "https://github.com/thanhpd123/295-bach-mai-tools",
} as const;

export interface NavItem {
    title: string;
    href: string;
}

/** Menu chính trong sidebar của dashboard */
export const navItems: NavItem[] = [
    { title: "Tổng quan", href: "/dashboard" },
    { title: "Thanh toán", href: "/dashboard/payments" },
];
