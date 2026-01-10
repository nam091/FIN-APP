# Hướng Dẫn Tích Hợp Google Calendar - Deploy Vercel

## 📋 Các Biến Môi Trường Cần Thiết

Khi deploy lên Vercel, bạn cần thiết lập **4 biến môi trường** sau:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=https://your-app-domain.vercel.app
```

---

## 🔧 BƯỚC 1: Tạo Google OAuth Credentials

### 1.1 Truy cập Google Cloud Console
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Chọn project → vào **APIs & Services** → **Credentials**

### 1.2 Kích hoạt Google Calendar API
1. Vào **APIs & Services** → **Library**
2. Tìm "Google Calendar API"
3. Click **Enable**

### 1.3 Tạo OAuth 2.0 Client ID
1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → chọn **OAuth client ID**
3. Chọn **Application type**: **Web application**
4. Đặt tên: `FinApp Production`

### 1.4 Cấu hình Authorized Redirect URIs
**QUAN TRỌNG**: Thêm URL callback của NextAuth

```
https://your-app-domain.vercel.app/api/auth/callback/google
```

**Ví dụ:**
- Domain Vercel: `https://fin-app-abc123.vercel.app`
- Redirect URI: `https://fin-app-abc123.vercel.app/api/auth/callback/google`

**Lưu ý:**
- Phải có `/api/auth/callback/google` ở cuối
- Phải dùng `https://` (không phải `http://`)
- Domain phải chính xác 100%

### 1.5 Lấy Credentials
Sau khi tạo xong, bạn sẽ nhận được:
- **Client ID**: `708894120621-xxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxx`

**Lưu lại 2 thông tin này!**

---

## 🚀 BƯỚC 2: Thiết Lập Biến Môi Trường Trên Vercel

### 2.1 Truy cập Vercel Dashboard
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào **Settings** → **Environment Variables**

### 2.2 Thêm Các Biến Môi Trường

#### ① GOOGLE_CLIENT_ID
- **Key**: `GOOGLE_CLIENT_ID`
- **Value**: Client ID từ Google Cloud Console
- **Environment**: Chọn **Production**, **Preview**, **Development**

#### ② GOOGLE_CLIENT_SECRET
- **Key**: `GOOGLE_CLIENT_SECRET`
- **Value**: Client Secret từ Google Cloud Console
- **Environment**: Chọn **Production**, **Preview**, **Development**

#### ③ NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Một chuỗi bí mật ngẫu nhiên

**Cách tạo NEXTAUTH_SECRET:**

**Option 1 - Dùng OpenSSL (Terminal):**
```bash
openssl rand -base64 32
```

**Option 2 - Dùng Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3 - Tự tạo:**
Chuỗi bất kỳ dài ít nhất 32 ký tự:
```
myapp_super_secret_key_2024_production_abc123xyz
```

#### ④ NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: URL production của app

**Ví dụ:**
```
https://fin-app-abc123.vercel.app
```

**Lưu ý:**
- KHÔNG có dấu `/` ở cuối
- Phải dùng `https://`
- Domain phải trùng với domain trong Google OAuth Redirect URI

---

## 📸 Hình Minh Họa Vercel Environment Variables

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                       │
├─────────────────────────────────────────────────────────────┤
│ GOOGLE_CLIENT_ID                                            │
│ 708894120621-xxx.apps.googleusercontent.com                 │
│ [Production] [Preview] [Development]                        │
├─────────────────────────────────────────────────────────────┤
│ GOOGLE_CLIENT_SECRET                                        │
│ GOCSPX-xxxxxxxxxxxxxxx                                      │
│ [Production] [Preview] [Development]                        │
├─────────────────────────────────────────────────────────────┤
│ NEXTAUTH_SECRET                                             │
│ myapp_super_secret_key_2024                                 │
│ [Production] [Preview] [Development]                        │
├─────────────────────────────────────────────────────────────┤
│ NEXTAUTH_URL                                                │
│ https://fin-app-abc123.vercel.app                           │
│ [Production]                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BƯỚC 3: Redeploy Ứng Dụng

Sau khi thêm biến môi trường, bạn cần redeploy:

### Option 1: Từ Vercel Dashboard
1. Vào **Deployments**
2. Chọn deployment mới nhất
3. Click **⋯** → **Redeploy**
4. Chọn **Use existing Build Cache**: **OFF**

### Option 2: Từ Git
1. Commit + push một thay đổi nhỏ
2. Vercel sẽ tự động build lại

---

## ✅ BƯỚC 4: Kiểm Tra Hoạt Động

### 4.1 Test Calendar Connection
1. Mở app: `https://your-app-domain.vercel.app`
2. Vào trang Calendar/Settings
3. Click nút **Connect Calendar**
4. Đăng nhập Google
5. Cho phép quyền truy cập Calendar
6. Kiểm tra xem có hiển thị "Connected" không

### 4.2 Kiểm Tra Console Logs
Nếu có lỗi, vào Vercel Dashboard:
1. **Deployments** → Chọn deployment mới nhất
2. **Functions** → Chọn function log
3. Xem lỗi (nếu có)

---

## ❌ Xử Lý Lỗi Thường Gặp

### Lỗi 1: "Redirect URI mismatch"
**Nguyên nhân**: Redirect URI trong Google Console không khớp

**Giải pháp:**
1. Vào Google Cloud Console → Credentials
2. Sửa lại Authorized redirect URIs:
   ```
   https://your-exact-domain.vercel.app/api/auth/callback/google
   ```
3. **Chú ý**: Domain phải chính xác 100%

### Lỗi 2: "Configuration error"
**Nguyên nhân**: Thiếu biến môi trường

**Giải pháp:**
1. Kiểm tra lại 4 biến trong Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
2. Redeploy sau khi thêm đủ

### Lỗi 3: "Invalid client secret"
**Nguyên nhân**: Client Secret sai hoặc có khoảng trắng

**Giải pháp:**
1. Copy lại Client Secret từ Google Console
2. Dán vào Vercel (không có khoảng trắng thừa)
3. Save và redeploy

### Lỗi 4: "Session error"
**Nguyên nhân**: NEXTAUTH_URL không đúng

**Giải pháp:**
1. Đảm bảo `NEXTAUTH_URL` = domain chính xác:
   ```
   https://fin-app-abc123.vercel.app
   ```
2. KHÔNG có `/` ở cuối
3. Redeploy

---

## 📝 Checklist Trước Khi Deploy

- [ ] Đã tạo Google OAuth Client ID
- [ ] Đã kích hoạt Google Calendar API
- [ ] Đã thêm Redirect URI chính xác
- [ ] Đã thiết lập 4 biến môi trường trên Vercel:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL`
- [ ] Domain trong `NEXTAUTH_URL` khớp với Redirect URI
- [ ] Đã redeploy sau khi thêm biến môi trường
- [ ] Đã test kết nối Calendar

---

## 🔐 Bảo Mật

**CẢNH BÁO:**
- **KHÔNG** commit file `.env` hoặc `.env.local` lên Git
- **KHÔNG** public Client Secret
- Chỉ thêm biến môi trường trực tiếp trên Vercel Dashboard

**File .gitignore đã bao gồm:**
```gitignore
.env
.env.local
.env*.local
```

---

## 🎯 Tóm Tắt Nhanh

```bash
# 1. Tạo Google OAuth Credentials
# → Lấy Client ID & Client Secret

# 2. Thêm vào Vercel Environment Variables:
GOOGLE_CLIENT_ID=708894120621-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxx
NEXTAUTH_SECRET=random_secret_key_here
NEXTAUTH_URL=https://your-app.vercel.app

# 3. Thêm Redirect URI trong Google Console:
https://your-app.vercel.app/api/auth/callback/google

# 4. Redeploy trên Vercel
# 5. Test kết nối Calendar
```

---

## 📞 Hỗ Trợ

Nếu vẫn gặp lỗi:
1. Kiểm tra lại logs trong Vercel Dashboard
2. Đảm bảo tất cả 4 biến đều đã set đúng
3. Verify Redirect URI trong Google Console khớp 100%
4. Clear cache browser và thử lại

**Chúc bạn deploy thành công!** 🚀
