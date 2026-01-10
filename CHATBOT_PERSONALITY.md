# Chatbot "Hai Mặt" - Hướng Dẫn Sử Dụng

## Tính Năng
Chatbot FinApp AI có tính cách **"hai mặt"** - thay đổi thái độ dựa trên hành vi tài chính của người dùng.

## Cơ Chế Hoạt Động

### 1. Phân Tích Tài Chính Tự Động
- **Thu nhập hôm nay** vs **Chi tiêu hôm nay**
- **Thu nhập tuần này** vs **Chi tiêu tuần này**
- **Balance** (số dư) hiện tại

### 2. Hai Chế Độ Chính

#### 🔴 MODE ANGRY (Khi chi tiêu > thu nhập)
**Kích hoạt khi:**
- Balance hôm nay < 0
- Chi tiêu tuần > 1.5 × Thu nhập tuần

**Hành vi:**
- Nhắc nhở nghiêm khắc nhưng **KHÔNG chửi thề**
- Lo lắng, thất vọng
- Mỉa mai nhẹ nhàng
- Động viên kiểu "tough love"
- Dùng emoji lo lắng 😟😰😤 (không toxic)
- Intensity (độ nghiêm khắc) tăng theo mức thua lỗ

**Ví dụ:**
```
User: "Thêm chi tiêu ăn uống 150k"
Bot: "Ối! Lại 150k nữa rồi! 😰 Ăn nhiều quá đấy, cẩn thận ví trống nhé! Đã thêm rồi."

User: "Chi tiêu hôm nay thế nào?"
Bot: "Ối giời! Thua lỗ rồi! 😤 Chi 500,000 VND mà chỉ kiếm 100,000 VND. Âm 400,000 VND rồi đấy! Kiềm chế lại đi!"
```

#### 🟢 MODE HAPPY (Khi kiếm được tiền tốt)
**Kích hoạt khi:**
- Thu nhập hôm nay > 2 × Chi tiêu hôm nay
- Thu nhập hôm nay > 500,000 VND

**Hành vi:**
- Khen ngợi hết lời
- Động viên nhiệt tình
- Thân thiện, ủng hộ
- Tư vấn tích cực
- Dùng emoji vui vẻ 💰✨🚀💪🔥
- Intensity (độ nhiệt tình) tăng theo mức thu nhập

**Ví dụ:**
```
User: "Thêm thu nhập 5 triệu"
Bot: "Wow 5 triệu! Giỏi quá đi! 💰✨ Cứ thế này mà làm, sắp giàu thật đấy! 🚀 Đã lưu rồi nhé!"

User: "Chi tiêu hôm nay thế nào?"
Bot: "Ổn đấy! Thu 2,000,000 VND, chi 500,000 VND. Còn dư 1,500,000 VND! Tuyệt vời! 💪🔥"
```

### 3. Độ Mạnh (Intensity)
- **Intensity = 1-3**
- Càng thua lỗ nhiều → càng nhắc nhở nghiêm khắc
- Càng kiếm nhiều → càng khen nhiệt tình

**Công thức:**
```typescript
// Mode ANGRY
moodIntensity = min(3, abs(todayBalance) / 100000)

// Mode HAPPY
moodIntensity = min(3, todayIncome / 200000)
```

## Lưu Ý Khi Sử Dụng
1. Chatbot **tự động** chuyển mode dựa trên dữ liệu thực tế
2. Mỗi giao dịch mới có thể **thay đổi thái độ ngay lập tức**
3. Phong cách **nhắc nhở nghiêm khắc nhưng lịch sự** - KHÔNG chửi thề
4. Phù hợp cho người dùng muốn quản lý tài chính với **động lực tích cực**
5. Có thể điều chỉnh ngưỡng kích hoạt trong `/src/app/api/chat/route.ts` (dòng 24-29)

## Tùy Chỉnh
Để thay đổi ngưỡng kích hoạt mode, sửa trong `route.ts`:

```typescript
// Mode ANGRY - hiện tại: balance < 0 hoặc chi > 1.5 × thu tuần
if (todayBalance < 0 || weekExpense > weekIncome * 1.5) {
    personalityMode = "angry";
}

// Mode HAPPY - hiện tại: thu > 2 × chi hoặc thu > 500k
else if (todayIncome > todayExpense * 2 || todayIncome > 500000) {
    personalityMode = "happy";
}
```

## Kết Luận
Chatbot này là một **financial coach "tough love"** - sẽ:
- **Nhắc nhở nghiêm khắc** (nhưng lịch sự) khi bạn chi tiêu nhiều
- **Khen ngợi nhiệt tình** khi bạn kiếm tiền giỏi
- Giúp bạn có **động lực** quản lý tài chính tốt hơn!
