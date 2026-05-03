# 💛 Ví của con — Money Tracker

Ứng dụng theo dõi số tiền trong người, cho mẹ xem và con cập nhật.

## Tính năng

- **Trang chính** (`/`) — Mẹ xem: số tiền hiện tại, biểu đồ, timeline cập nhật theo giờ
- **Trang Admin** (`/admin`) — Con cập nhật: nhập số tiền mới, ghi chú, xoá mục cũ

## Deploy lên Vercel (miễn phí)

### Bước 1 — Đưa code lên GitHub

1. Tạo tài khoản [GitHub](https://github.com) nếu chưa có
2. Tạo repo mới (New repository), đặt tên `money-tracker`
3. Upload toàn bộ thư mục này lên GitHub

### Bước 2 — Deploy lên Vercel

1. Tạo tài khoản [Vercel](https://vercel.com) (dùng GitHub để đăng nhập)
2. Click **"New Project"**
3. Import repo `money-tracker` từ GitHub
4. Click **Deploy** — xong!

Vercel sẽ tự build và cấp domain dạng: `money-tracker-xxx.vercel.app`

### Bước 3 — Dùng thôi!

- Gửi link trang chính cho mẹ bookmark
- Con vào `/admin` để cập nhật số tiền bất cứ lúc nào

## Chạy local để test

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Lưu ý

Dữ liệu được lưu trong **localStorage** của trình duyệt — nghĩa là:
- Mỗi thiết bị lưu dữ liệu riêng
- Con cập nhật trên điện thoại → mẹ xem trên máy tính sẽ **không thấy**

**Để mẹ xem được dữ liệu con cập nhật**, bạn cần nâng cấp lên database (Vercel KV hoặc Supabase). Nhắn Claude để được hướng dẫn thêm!
