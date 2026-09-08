# Chủ Trọ — Quản lý phòng trọ & thu tiền

**Chủ Trọ** là ứng dụng full-stack **Next.js** (App Router) giúp chủ nhà trọ quản lý phòng, người thuê, hợp đồng, chỉ số điện/nước, hoá đơn hằng tháng và **đối soát tiền chuyển khoản tự động** qua webhook **SePay**. Ứng dụng gồm hai giao diện theo vai trò:

- **Chủ nhà / quản lý** → `/dashboard`: quản lý phòng, người thuê, kỳ & chỉ số, hoá đơn, giao dịch, cài đặt.
- **Người thuê** → `/app`: xem hoá đơn của mình và quét mã **VietQR** để thanh toán.

Sẵn sàng deploy lên **Vercel**.

> 📖 Kiến trúc chi tiết: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server + Client Components, Route Handlers |
| Ngôn ngữ | **TypeScript** (strict) | Type-safe toàn bộ |
| UI | **Tailwind CSS v4** + `lucide-react` | Tự build component UI |
| Database | **PostgreSQL** + **Prisma 7** | driver adapter `@prisma/adapter-pg` |
| Validation | **Zod 4** | Validate input ở tầng API |
| Auth | **jose** (JWT) + **bcryptjs** | Custom auth, httpOnly cookie — không dùng Auth.js |
| Đối soát | **SePay webhook** + **VietQR** | Tự động khớp chuyển khoản với hoá đơn |
| Deploy | **Vercel** | Serverless, auto CI/CD |

---

## 2. Cấu trúc thư mục

```
manager-payment-tools/
├── prisma/
│   ├── schema.prisma          # 12 model (User, Tenant, Room, Lease, ...)
│   └── seed.ts                # 38 phòng + dữ liệu demo
├── scripts/
│   ├── check-db.ts            # Kiểm tra dữ liệu sau seed
│   └── create-admin.ts        # Tạo/upsert tài khoản ADMIN (production)
├── public/                    # PWA: manifest, service worker, icons
├── branding/                  # Logo & icon thương hiệu (SVG)
├── src/
│   ├── proxy.ts               # Route guard (Next 16: thay cho middleware)
│   ├── app/
│   │   ├── layout.tsx         # Root layout (metadata, font)
│   │   ├── page.tsx           # Landing (/)
│   │   ├── login/             # Trang đăng nhập
│   │   ├── app/               # Giao diện NGƯỜI THUÊ (/app)
│   │   ├── dashboard/         # Giao diện CHỦ NHÀ (/dashboard)
│   │   └── api/               # ===== Back-end (Route Handlers) =====
│   ├── components/
│   │   ├── ui/                # Button, Card, Badge, Input, CopyButton...
│   │   ├── admin/             # rooms-manager, tenants-manager, invoices-list...
│   │   ├── dashboard/         # Sidebar, Header
│   │   ├── payments/          # payments-list
│   │   ├── tenant/            # invoice-card, payment-hero, bottom-nav...
│   │   └── auth/              # login-form, change-password-form
│   ├── config/site.ts         # Tên app, mô tả, menu điều hướng
│   ├── generated/prisma/      # Prisma Client (sinh tự động, gitignored)
│   ├── lib/
│   │   ├── db.ts              # Prisma Client singleton
│   │   ├── api/               # response (ok/fail), error-handler, errors
│   │   ├── auth/              # jwt, session, current-user, password
│   │   ├── services/          # Service layer (business logic)
│   │   ├── validation/        # Zod schemas (auth, billing, lease, room, tenant...)
│   │   ├── serializers.ts     # Decimal/Date → number/ISO string
│   │   ├── labels.ts          # Nhãn tiếng Việt cho enum
│   │   ├── vietqr.ts          # URL ảnh mã QR VietQR
│   │   ├── api-client.ts      # Helper gọi API từ client
│   │   └── utils.ts           # cn, formatCurrency, formatDate
│   └── types/index.ts         # DTO & type dùng chung
├── .env.example               # Biến môi trường mẫu (commit)
├── .env                       # Biến môi trường thật (KHÔNG commit)
├── prisma.config.ts           # Cấu hình Prisma CLI
├── next.config.ts
├── tsconfig.json
└── package.json
```

**Luồng xử lý một request API:**

```
Route Handler → validate bằng Zod → gọi Service (src/lib/services)
             → truy vấn Prisma → serialize → trả JSON chuẩn
```

---

## 3. Chạy dự án ở local

```bash
# 1. Cài dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env        # điền DATABASE_URL, DIRECT_URL, AUTH_SECRET

# 3. Đồng bộ schema (đang dùng db push, chưa có migration)
npm run db:push

# 4. Thêm dữ liệu demo (38 phòng, tài khoản mẫu)
npm run db:seed

# 5. Chạy dev server
npm run dev
```

Mở `http://localhost:3000` → đăng nhập → `/dashboard` (chủ nhà) hoặc `/app` (người thuê).

---

## 4. Các lệnh thường dùng

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (hot reload) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:push` | Đồng bộ schema (không tạo migration) |
| `npm run db:seed` | Xoá & tạo lại dữ liệu demo (chỉ dev) |
| `npm run db:create-admin` | Tạo/upsert tài khoản ADMIN (production) |
| `npm run db:studio` | Mở Prisma Studio |

---

## 5. API endpoints

**Auth**

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập (username/SĐT + mật khẩu) |
| `POST` | `/api/auth/logout` | Đăng xuất |
| `GET` | `/api/auth/me` | Thông tin người dùng hiện tại |
| `POST` | `/api/auth/change-password` | Đổi mật khẩu |

**Quản lý (chỉ ADMIN)**

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/rooms` | Danh sách phòng |
| `PATCH` | `/api/rooms/:id` | Cập nhật phòng |
| `GET` | `/api/leases` | Danh sách hợp đồng |
| `POST` | `/api/leases` | Tạo hợp đồng thuê |
| `POST` | `/api/leases/:id/end` | Kết thúc hợp đồng |
| `GET` / `POST` | `/api/tenants` | Danh sách / tạo người thuê |
| `GET` / `PATCH` / `DELETE` | `/api/tenants/:id` | Chi tiết / cập nhật / xoá |
| `POST` | `/api/tenants/:id/reset-password` | Đặt lại mật khẩu |
| `GET` / `POST` | `/api/billing-periods` | Danh sách / tạo kỳ thanh toán |
| `GET` | `/api/billing-periods/:id` | Chi tiết kỳ |
| `POST` | `/api/billing-periods/:id/close` | Chốt kỳ |
| `GET` / `POST` | `/api/meter-readings` | Chỉ số điện nước |
| `GET` | `/api/invoices` | Danh sách hoá đơn |
| `GET` / `PATCH` | `/api/invoices/:id` | Chi tiết / cập nhật hoá đơn |
| `POST` | `/api/invoices/generate` | Sinh hoá đơn từ kỳ |
| `POST` | `/api/invoices/:id/mark-paid` | Đánh dấu đã thanh toán |
| `PATCH` | `/api/invoices/:id/items` | Sửa chi tiết phí |
| `GET` | `/api/transfers` | Giao dịch chuyển khoản |
| `GET` / `POST` | `/api/bank-accounts` | Tài khoản ngân hàng nhận tiền |
| `PATCH` / `DELETE` | `/api/bank-accounts/:id` | Cập nhật / xoá |
| `GET` / `PUT` | `/api/settings/fees` | Đơn giá mặc định |
| `GET` | `/api/dashboard/stats` | Số liệu tổng quan |
| `GET` | `/api/audit-logs` | Nhật ký hành động |
| `GET` | `/api/health` | Health check |

**Webhook (SePay)**

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/webhooks/sepay` | Nhận giao dịch, đối soát tự động |

> ⚠️ `/api/payments*` là API cũ của app phòng khám, hiện trả `410 Gone` — đã được thay bằng `/api/invoices*`.

**Format response chuẩn:**

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "message": "...", "details": {} } }
```

---

## 6. Tài khoản demo (sau `npm run db:seed`)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Chủ nhà (ADMIN) | `admin` | `bachmai295` |
| Người thuê | `nguyenvana` | `tenant123` |
| Người thuê | `tranthib` | `tenant123` |

---

## 7. Thương hiệu "Chủ Trọ"

Tên mới thay cho **QLPT** (Quản Lí Phòng Trọ). **Chủ Trọ** — ngắn, đúng đối tượng (chủ nhà trọ).

- **Logo**: ngôi nhà trắng với **cửa hình lỗ khóa (keyhole)** trên nền teal gradient — ngôi nhà = phòng trọ, lỗ khóa = "chìa khóa quản lý".

| Vai trò | Mã màu | Ghi chú |
|---|---|---|
| Primary | `#0F766E` | Teal đậm |
| Mid | `#14B8A6` | Teal trung |
| Light | `#2DD4BF` | Teal nhạt |
| Text đậm | `#0F172A` | — |
| Text phụ | `#64748B` | — |

File logo/icon nằm trong `branding/`.

---

## 8. Biến môi trường

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Kết nối PostgreSQL qua pooler (runtime) |
| `DIRECT_URL` | Kết nối trực tiếp (migration) |
| `NEXT_PUBLIC_APP_URL` | URL công khai của app |
| `AUTH_SECRET` | Khoá ký JWT (bắt buộc khi deploy) |
| `SEPA_WEBHOOK_SECRET` | Token xác minh webhook SePay |

---

## 9. Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vercel → **Add New → Project** → import repo.
3. Thêm **Environment Variables** ở mục 8.
4. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel tự build & deploy lại.

> 💡 `postinstall → prisma generate` chạy tự động. Schema DB hiện dùng `db:push` (chưa có thư mục migration).

---

## 10. Hướng phát triển tiếp theo

- Tạo migration chính thức (`prisma migrate`) thay cho `db:push`.
- Báo cáo doanh thu, xuất Excel/PDF.
- Nhắc hạn thanh toán tự động (Zalo/email).
- Giá điện theo bậc, bảng giá riêng từng phòng.
