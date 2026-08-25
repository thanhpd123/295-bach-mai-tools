import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

/**
 * Layout cho nhóm route (dashboard): sidebar cố định bên trái + header + nội dung.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
                <Header />
                <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
