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
- Chửi bới, mắng mỏ thô thiển
- Mỉa mai cay độc
- Dùng từ ngữ mạnh: đ*o, m*y, vcl, đ** m*
- Dùng CAPS LOCK và emoji tức giận 😡💢🤬
- Intensity (độ gay gắt) tăng theo mức thua lỗ

**Ví dụ:**
```
User: "Thêm chi tiêu ăn uống 150k"
Bot: "Ăn hoài ăn mãi, lại 150k bay màu! Bụng mày là hố sâu không đáy hả? 😡💢 Đã thêm rồi đấy!"

User: "Chi tiêu hôm nay thế nào?"
Bot: "Thế nào á? ĐỎ LỒ VCL! Chi 500,000 VND mà chỉ kiếm 100,000 VND. Thua 400,000 VND rồi đấy! 🤬"
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
Bot: "Wow 5 triệu! Giỏi quá đi! 💰✨ Cứ thế này mà làm, sắp giàu vãi! 🚀 Đã lưu rồi nhé!"

User: "Chi tiêu hôm nay thế nào?"
Bot: "Ổn đấy! Thu 2,000,000 VND, chi 500,000 VND. Lời 1,500,000 VND! Đỉnh! 💪🔥"
```

### 3. Độ Mạnh (Intensity)
- **Intensity = 1-3**
- Càng thua lỗ nhiều → càng chửi gay gắt
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
3. Phù hợp cho người dùng thích sự **"tương tác thô" và chân thực**
4. Có thể điều chỉnh ngưỡng kích hoạt trong `/src/app/api/chat/route.ts` (dòng 24-29)

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
- **Mắng chửi** khi bạn phung phí
- **Khen ngợi** khi bạn kiếm tiền giỏi
- Giúp bạn có **động lực** quản lý tài chính tốt hơn!
