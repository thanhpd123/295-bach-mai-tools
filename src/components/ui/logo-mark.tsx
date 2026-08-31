/** Dấu logo "Chủ Trọ": ngôi nhà trắng + cửa lỗ khóa trên nền teal. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 512 512"
            className={className}
            role="img"
            aria-label="Chủ Trọ"
        >
            <rect width="512" height="512" rx="116" fill="#0F766E" />
            <path
                d="M256 96 L116 232 H148 V352 H364 V232 H396 Z"
                fill="#FFFFFF"
            />
            <circle cx="256" cy="274" r="38" fill="#0F766E" />
            <path d="M218 274 H294 L280 336 H232 Z" fill="#0F766E" />
        </svg>
    );
}
