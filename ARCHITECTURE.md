# Kiến trúc dự án

Tài liệu này giải thích **tại sao** dự án được tổ chức như vậy và **cách mở rộng** thêm tính năng một cách nhất quán.

---

## 1. Nguyên tắc thiết kế

1. **Một repo, hai vai trò**: Next.js App Router cho phép viết cả front-end (Server/Client Components) lẫn back-end (Route Handlers) trong cùng dự án — không cần tách 2 service riêng khi quy mô còn nhỏ, nhưng vẫn tách **lớp (layer)** rõ ràng để dễ scale.

2. **Phân tầng rõ ràng** (Separation of Concerns):

```
app/api/* (Route Handler)  →  chỉ parse request, validate, trả response
        │ gọi xuống
        ▼
lib/services/* (Service)   →  business logic, truy vấn DB
        │ dùng
        ▼
lib/db.ts (Prisma Client)  →  kết nối database
```

3. **DTO tách biệt với Model**: dữ liệu Prisma (Decimal, Date) được chuyển thành JSON thuần (number, ISO string) trước khi trả về client — nằm trong `lib/serializers.ts` và `types/index.ts`.

4. **Validate ở biên**: mọi input từ client đều qua **Zod** (`lib/validation`) trước khi vào service.

---

## 2. Giải thích từng phần

### `src/app/api` — Route Handlers (Back-end)

Mỗi thư mục là một endpoint:

- `api/payments/route.ts` — xử lý `GET` (danh sách) và `POST` (tạo).
- `api/payments/[id]/route.ts` — xử lý `GET/PATCH/DELETE` theo id.

Các route này đều có `export const dynamic = "force-dynamic"` để **không bị prerender** ở build time (vì cần database ở runtime).

**Response format chuẩn** (xem `lib/api/response.ts`):

```ts
ok(data)   → { success: true,  data }
fail(msg)  → { success: false, error: { message, details } }
```

Lỗi được gom vào `handleApiError` (`lib/api/error-handler.ts`): nhận diện lỗi Zod (422), lỗi Prisma P2002 (409 - trùng), P2025 (404 - không tìm thấy).

### `src/lib/services` — Service layer

Chứa logic nghiệp vụ. Route handler **không** chứa SQL/query trực tiếp — mọi truy vấn nằm trong service. Lợi ích:

- Dễ viết unit test (không cần mock HTTP).
- Có thể gọi lại từ Server Component (trang) mà không cần qua HTTP.
- Logic tập trung, tránh trùng lặp.

### `src/lib/db.ts` — Prisma singleton

```ts
export const db = globalForPrisma.prisma ?? createPrismaClient();
```

Dùng `globalThis` để tái sử dụng connection pool giữa các lần hot-reload (tránh `Too many connections`), đặc biệt quan trọng trên **Vercel serverless** (mỗi hàm có thể chạy nhiều instance).

> ⚠️ **Prisma 7 lưu ý quan trọng**:
> - Generator mới là `prisma-client` (sinh code vào `src/generated/prisma`, **gitignored**).
> - Bắt buộc dùng **driver adapter**: `new PrismaClient({ adapter: new PrismaPg(...) })` (`@prisma/adapter-pg`).
> - `postinstall: prisma generate` tự sinh lại client sau `npm install` (cả trên Vercel).
> - `prisma.config.ts` load `.env` qua `dotenv/config`.

### `src/components` — UI

- `ui/` — component tái sử dụng **không chứa logic nghiệp vụ** (Button, Card, Badge, Input).
- `dashboard/` — khung giao diện dashboard (Sidebar dùng `"use client"` để biết route đang active).
- `payments/` — component gắn logic (fetch API, phân trang, tìm kiếm).

### Server Components vs Client Components

- Mặc định là **Server Component** (trang, layout, header...) → render ở server, SEO tốt.
- Chỉ thêm `"use client"` khi cần tương tác: `Sidebar`, `PaymentsList`.

---

## 3. Cách thêm một tính năng mới (pattern chuẩn)

Ví dụ thêm module **Dịch vụ (Service)**:

1. **Schema**: thêm/điều chỉnh model trong `prisma/schema.prisma` → `npm run db:migrate`.
2. **Validation**: tạo `src/lib/validation/service.ts` (Zod schema).
3. **Service**: tạo `src/lib/services/service.service.ts` (hàm CRUD).
4. **API**: tạo `src/app/api/services/route.ts` và `src/app/api/services/[id]/route.ts`.
5. **Types + Serializer**: thêm DTO vào `src/types/index.ts`, hàm serialize nếu cần.
6. **UI**: tạo trang `src/app/dashboard/services/page.tsx` + component trong `src/components/services/`.
7. **Menu**: thêm mục vào `navItems` trong `src/config/site.ts`.

---

## 4. Mô hình dữ liệu (Prisma)

```
Patient ──1──n── Payment ──1──n── PaymentItem ──n──1── Service
```

| Model | Ý nghĩa |
|---|---|
| `Patient` | Bệnh nhân (mã BN-xxx) |
| `Service` | Dịch vụ/hạng mục thu phí (mã DV-xxx, đơn giá) |
| `Payment` | Phiếu thu (mã PT-yyyy-xxxxx, tổng tiền, trạng thái, phương thức) |
| `PaymentItem` | Chi tiết từng dịch vụ trong phiếu thu |

Enum: `PaymentStatus` (PENDING/PAID/REFUNDED/CANCELLED), `PaymentMethod` (CASH/BANK_TRANSFER/MOMO/ZALOPAY).

---

## 5. Môi trường & bảo mật

- `.env` (thật) bị **gitignore**; chỉ commit `.env.example`.
- `DATABASE_URL` không bao giờ để lộ ở client — chỉ dùng ở server (API/service). Biến public phải có tiền tố `NEXT_PUBLIC_`.
- Lỗ hổng `deepmerge-ts` (báo trong `npm audit`) nằm trong `@prisma/config` — chỉ dùng bởi **Prisma CLI** ở build-time, **không** nằm trong bundle chạy production nên an toàn để yên (bản vá yêu cầu hạ cấp Prisma, không nên làm).

---

## 6. CI/CD trên Vercel

```
Git push → Vercel nhận webhook → npm install (postinstall: prisma generate)
        → next build → deploy
```

Khi thay đổi schema DB, trước khi deploy cần chạy migration (`prisma migrate deploy`) — có thể thêm vào script build hoặc chạy thủ công qua Vercel CLI.
