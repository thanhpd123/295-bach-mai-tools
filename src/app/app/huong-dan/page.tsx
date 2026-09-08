import type { Metadata } from "next";
import { CopyAppLink } from "@/components/tenant/copy-app-link";

export const metadata: Metadata = { title: "Hướng dẫn sử dụng" };

const steps = [
    {
        title: "Cài đặt ứng dụng về điện thoại",
        body: (
            <>
                <p>
                    <strong>iPhone (Safari):</strong> mở link → nhấn nút Chia sẻ
                    (ô vuông có mũi tên) → chọn{" "}
                    <em>“Thêm vào Màn hình chính”</em> → nhấn <em>“Thêm”</em>.
                </p>
                <p>
                    <strong>Android (Chrome):</strong> mở link → nhấn menu ⋮ →
                    chọn <em>“Thêm vào Màn hình chính”</em> hoặc{" "}
                    <em>“Cài đặt ứng dụng”</em>.
                </p>
            </>
        ),
    },
    {
        title: "Đăng nhập",
        body: (
            <p>
                Dùng <strong>tên đăng nhập</strong> (hoặc số điện thoại) và{" "}
                <strong>mật khẩu</strong> do chủ nhà cấp.
            </p>
        ),
    },
    {
        title: "Xem hoá đơn",
        body: (
            <p>
                Màn hình chính hiển thị{" "}
                <strong>số tiền cần thanh toán</strong>, hạn thanh toán và chi
                tiết các khoản phí (phòng, điện, nước…).
            </p>
        ),
    },
    {
        title: "Thanh toán",
        body: (
            <>
                <p>
                    Quét <strong>mã QR</strong> bằng app ngân hàng, hoặc chuyển
                    khoản thủ công theo thông tin hiển thị.
                </p>
                <p className="rounded-lg bg-amber-400/10 px-3 py-2 text-amber-300">
                    ⚠️ Nội dung chuyển khoản phải ghi đúng{" "}
                    <strong>MÃ HOÁ ĐƠN</strong> (ví dụ HD-2608-102) để hệ thống
                    tự ghi nhận.
                </p>
            </>
        ),
    },
    {
        title: "Hoàn tất",
        body: (
            <p>
                Khi tiền về tài khoản, hoá đơn sẽ tự động chuyển sang trạng thái{" "}
                <strong>“Đã thanh toán”</strong>.
            </p>
        ),
    },
];

export default function GuidePage() {
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Hướng dẫn sử dụng</h1>

            <div className="glass rounded-2xl p-5">
                <p className="mb-3 text-sm text-slate-400">
                    Gửi link đăng nhập cho người thuê qua Zalo/Messenger:
                </p>
                <CopyAppLink />
            </div>

            <div className="space-y-4">
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className="glass rounded-2xl p-5"
                    >
                        <h2 className="font-semibold text-white">
                            {i + 1}. {step.title}
                        </h2>
                        <div className="mt-2 space-y-2 text-sm text-slate-300">
                            {step.body}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
