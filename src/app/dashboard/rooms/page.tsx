import type { Metadata } from "next";
import { RoomsManager } from "@/components/admin/rooms-manager";

export const metadata: Metadata = { title: "Quản lý phòng" };

export default function RoomsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Phòng
                </h1>
                <p className="text-sm text-slate-400">
                    Cập nhật trạng thái trống/đang thuê và giá phòng.
                </p>
            </div>
            <RoomsManager />
        </div>
    );
}
