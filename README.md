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
│   ├── create-admin.ts        # Tạo/upsert tài khoản ADMIN (production)
│   └── generate-icons.cjs     # Sinh icon PWA từ assets/
├── public/                    # PWA: manifest, service worker, icons (sinh ra)
├── assets/                    # Logo & icon thương hiệu (SVG nguồn)
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
| `npm run icons` | Sinh icon PWA (SVG + PNG) từ `assets/` |

---

## 6. Tài khoản demo (sau `npm run db:seed`)

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Chủ nhà (ADMIN) | `admin` | `bachmai295` |
| Người thuê | `0336677789` | `Satthuso2` |


