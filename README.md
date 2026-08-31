# Chủ Trọ — Ứng dụng quản lý phòng trọ & thu tiền

Ứng dụng **full-stack Next.js** (viết cả front-end lẫn back-end trong cùng một repo) dùng để quản lý phòng trọ: phòng, người thuê, hoá đơn và thu tiền điện nước hàng tháng. Sẵn sàng deploy lên **Vercel**.

> 📖 Muốn hiểu sâu kiến trúc, đọc thêm [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components + API Routes |
| Ngôn ngữ | **TypeScript** (strict) | Type-safe toàn bộ |
| UI | **Tailwind CSS v4** + `lucide-react` | Tự build component UI, không phụ thuộc UI kit |
| Database | **PostgreSQL** + **Prisma 7** | ORM + migration + seed |
| Validation | **Zod** | Validate input ở tầng API |
| Deploy | **Vercel** | Serverless, auto CI/CD từ GitHub |

---

## 2. Cấu trúc thư mục

```
manager-payment-tools/
├── prisma/
│   ├── schema.prisma        # Định nghĩa model DB (Patient, Service, Payment...)
│   └── seed.ts              # Dữ liệu mẫu để phát triển
├── public/                  # Static assets
├── src/
│   ├── app/                 # ===== Next.js App Router =====
│   │   ├── layout.tsx       # Root layout (metadata, font)
│   │   ├── page.tsx         # Trang landing (/)  — front-end
│   │   ├── not-found.tsx    # Trang 404
│   │   ├── dashboard/
│   │   │   ├── layout.tsx   # Layout dashboard (sidebar + header)
│   │   │   ├── page.tsx     # /dashboard — tổng quan
│   │   │   └── payments/
│   │   │       └── page.tsx # /dashboard/payments — danh sách phiếu thu
│   │   └── api/             # ===== Back-end (Route Handlers) =====
│   │       ├── health/route.ts          # GET /api/health
│   │       └── payments/
│   │           ├── route.ts             # GET (list) + POST (create)
│   │           └── [id]/route.ts        # GET + PATCH + DELETE
│   ├── components/
│   │   ├── ui/              # Component UI tái sử dụng (Button, Card, Badge, Input)
│   │   ├── dashboard/       # Sidebar, Header
│   │   └── payments/        # Bảng danh sách thanh toán (client)
│   ├── config/
│   │   └── site.ts          # Hằng số chung: tên app, menu...
│   ├── lib/
│   │   ├── db.ts            # Prisma Client singleton
│   │   ├── api/             # response.ts, error-handler.ts
│   │   ├── services/        # Service layer (business logic) — payment.service.ts
│   │   ├── validation/      # Zod schemas — payment.ts
│   │   ├── serializers.ts   # Prisma Decimal/Date → JSON
│   │   ├── labels.ts        # Nhãn tiếng Việt cho enum
│   │   ├── api-client.ts    # Helper gọi API từ client
│   │   └── utils.ts         # cn, formatCurrency, formatDate
│   └── types/
│       └── index.ts         # DTO & type dùng chung
├── .env.example             # Biến môi trường mẫu (commit lên Git)
├── .env                     # Biến môi trường thật (KHÔNG commit)
├── prisma.config.ts         # Cấu hình Prisma CLI
├── next.config.ts
├── tsconfig.json
└── package.json
```

> **Luồng xử lý một request API:**
> `Route Handler (app/api)` → validate bằng **Zod** → gọi **Service** (`src/lib/services`) → truy vấn **Prisma** → serialize → trả JSON chuẩn.

---

## 3. Chạy dự án ở local

```bash
# 1. Cài dependencies
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env          # rồi điền DATABASE_URL thật

# 3. Tạo bảng trong database
npm run db:migrate            # hoặc npm run db:push (nhanh, không tạo migration)

# 4. (Tuỳ chọn) thêm dữ liệu mẫu
npm run db:seed

# 5. Chạy dev server
npm run dev
```

Mở `http://localhost:3000` → trang landing, vào `/dashboard` → giao diện quản lý.

---

## 4. Các lệnh thường dùng

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (hot reload) |
| `npm run build` | Build production |
| `npm run start` | Chạy bản production |
| `npm run lint` | Kiểm tra ESLint |
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:migrate` | Tạo migration (dev) |
| `npm run db:deploy` | Chạy migration (production/Vercel) |
| `npm run db:push` | Đồng bộ schema nhanh (không tạo migration) |
| `npm run db:seed` | Thêm dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio (xem DB) |

---

## 5. API endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/payments` | Danh sách phiếu thu (`?page=&limit=&search=&status=`) |
| `POST` | `/api/payments` | Tạo phiếu thu |
| `GET` | `/api/payments/:id` | Chi tiết phiếu thu |
| `PATCH` | `/api/payments/:id` | Cập nhật phiếu thu |
| `DELETE` | `/api/payments/:id` | Xoá phiếu thu |

**Format response chuẩn:**
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "...", "details": {} } }
```

---

## 6. Deploy lên Vercel

1. Đẩy code lên GitHub (xem mục 7).
2. Vào [vercel.com](https://vercel.com) → **Add New → Project** → import repo `thanhpd123/295-bach-mai-tools`.
3. Vercel tự nhận diện Next.js (không cần cấu hình thêm).
4. Thêm **Environment Variables** trong Vercel:
   - `DATABASE_URL` — chuỗi kết nối PostgreSQL (dùng **Vercel Postgres**, **Neon**, **Supabase**...).
   - `NEXT_PUBLIC_APP_URL` — URL của app sau khi deploy.
5. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel tự build & deploy lại.

> 💡 Khi schema DB thay đổi, Vercel chạy `postinstall → prisma generate` tự động. Migration chạy bằng `npm run db:deploy` hoặc thiết lập trong Vercel.

---

## 7. Đẩy code lên GitHub

Đã cấu hình remote:

```bash
git remote add origin https://github.com/thanhpd123/295-bach-mai-tools.git
git push -u origin main
```

---

## 8. Hướng phát triển tiếp theo

- Thêm trang **tạo/sửa phiếu thu** (form + `POST/PATCH /api/payments`).
- Thêm **authentication** (NextAuth/Auth.js) và phân quyền.
- Thêm module **Bệnh nhân**, **Dịch vụ** (theo pattern hiện có).
- Thêm **báo cáo doanh thu**, xuất Excel/PDF.
