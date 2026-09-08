import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 text-center">
            <div className="text-gradient text-6xl font-bold">404</div>
            <h1 className="text-xl font-semibold text-white">
                Không tìm thấy trang
            </h1>
            <p className="text-sm text-slate-400">
                Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-linear-to-r from-teal-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(34,211,238,0.18)] transition-all hover:brightness-110"
            >
                Về trang chủ
            </Link>
        </div>
    );
}
