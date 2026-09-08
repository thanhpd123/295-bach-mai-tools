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
        <div className="relative flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
                <Header />
                <main className="mx-auto w-full max-w-[1400px] flex-1 p-5 md:p-8 lg:p-9">
                    {children}
                </main>
            </div>
        </div>
    );
}
