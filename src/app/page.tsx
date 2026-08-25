import { redirect } from "next/navigation";

/** Trang chủ — chuyển thẳng tới trang đăng nhập. */
export default function HomePage() {
    redirect("/login");
}
