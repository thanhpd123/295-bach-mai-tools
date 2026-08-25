import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center">
            <div className="text-6xl font-bold text-slate-300">404</div>
            <h1 className="text-xl font-semibold text-slate-900">
                Không tìm thấy trang
            </h1>
            <p className="text-sm text-slate-500">
                Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <Link
                href="/"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
                Về trang chủ
            </Link>
        </div>
    );
}
