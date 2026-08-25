import { siteConfig } from "@/config/site";

/** Thanh header cố định phía trên của dashboard */
export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
            <div className="text-sm font-medium text-slate-500">
                Hệ thống quản lý thanh toán
            </div>
            <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
                title="GitHub repository"
            >
                GH
            </a>
        </header>
    );
}
