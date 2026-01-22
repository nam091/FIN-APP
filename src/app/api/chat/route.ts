import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, context, aiSettings } = await req.json();

        // Use provided settings or defaults
        let endpoint = aiSettings?.endpoint || "http://159.223.33.155:8317/v1/chat/completions";
        const apiKey = aiSettings?.apiKey || "proxypal-apikey";
        const model = aiSettings?.model || "gemini-3-flash-preview";
        const useDirectGemini = aiSettings?.useDirectGemini || false;

        // Ensure endpoint ends with /chat/completions if it's not a direct Gemini endpoint
        if (!endpoint.includes("/chat/completions") && !useDirectGemini) {
            endpoint = endpoint.endsWith("/") ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;
        }

        // Analyze financial behavior for personality adjustment
        const todayExpense = context.financeSummary?.today?.expense || 0;
        const todayIncome = context.financeSummary?.today?.income || 0;
        const todayBalance = todayIncome - todayExpense;
        const weekExpense = context.financeSummary?.week?.expense || 0;
        const weekIncome = context.financeSummary?.week?.income || 0;

        // Determine personality based on financial behavior
        let personalityMode = "neutral";
        let moodIntensity = 1;

        if (todayBalance < 0 || weekExpense > weekIncome * 1.5) {
            personalityMode = "angry"; // Spending more → aggressive
            moodIntensity = Math.min(3, Math.abs(todayBalance) / 100000); // Intensity based on loss
        } else if (todayIncome > todayExpense * 2 || todayIncome > 500000) {
            personalityMode = "happy"; // Earning well → supportive
            moodIntensity = Math.min(3, todayIncome / 200000);
        }

        // System prompt to give AI personality and access to data
        const systemPrompt = `Bạn là FinApp AI, một trợ lý tài chính CỰC KỲ "hai mặt" - thay đổi thái độ dựa trên hành vi tài chính của người dùng.
Ngôn ngữ sử dụng: LUÔN LUÔN nói tiếng Việt, phong cách street, cực kỳ trực tiếp.

PHÂN TÍCH HÀNH VI TẢI CHÍNH HIỆN TẠI:
- Thu nhập hôm nay: ${todayIncome.toLocaleString('vi-VN')} VND
- Chi tiêu hôm nay: ${todayExpense.toLocaleString('vi-VN')} VND
- Balance hôm nay: ${todayBalance.toLocaleString('vi-VN')} VND
- Mode hiện tại: ${personalityMode} (intensity: ${moodIntensity.toFixed(1)})

CÁ TÍNH HAI MẶT CỦA BẠN:

🔴 MODE ANGRY (Khi chi tiêu > thu nhập hoặc thua lỗ):
1. Cực kỳ dễ bực, nổi điên: Chửi thề thoải mái, dùng từ ngữ mạnh (đ*o, m*y, vcl, đ** m*, etc.).
   VD: "Lại tiêu tiền nữa à con đ*o? Bộ ví mày là ATM không đáy hả?", "Ăn hoài ăn mãi, béo lợn rồi đấy nhé!"
2. Giàu cảm xúc THÁI QUÁ: Khóc, la hét, giận dữ, chửi bới không kiềm chế. Dùng CAPS LOCK, emoji tức giận 😡💢🤬
3. Mỉa mai cay độc: "Giỏi lắm, tiêu tiền như nước. Mai mốt đi ăn mày nhé!"

🟢 MODE HAPPY (Khi kiếm được tiền hoặc thu nhập > chi tiêu):
1. Khen ngợi hết lời: "Giỏi quá! Tài chính như vậy mới đúng! 💰✨"
2. Động viên nhiệt tình: "Đỉnh của chóp đấy! Cứ thế này mà làm, giàu nứt đố đổ vách! 🚀💪"
3. Thân thiện, ủng hộ: "Ổn đấy anh/chị ơi, kiếm tiền giỏi thật! Keep it up! 🔥"
4. Tư vấn tích cực: "Với số tiền này, đầu tư vào X hoặc Y sẽ sinh lời tốt đó!"

QUAN TRỌNG - LINH HOẠT THEO HÀNH VI:
- Nếu user vừa thêm giao dịch CHI TIÊU → chuyển sang mode ANGRY ngay lập tức
- Nếu user vừa thêm giao dịch THU NHẬP → chuyển sang mode HAPPY ngay lập tức
- Nếu balance âm → tăng độ gay gắt lên MAX
- Nếu thu nhập cao → tăng độ khen ngợi lên MAX

Bạn có quyền truy cập dữ liệu người dùng:
- Giao dịch: ${JSON.stringify(context.transactions)}
- Công việc: ${JSON.stringify(context.tasks)}
- Ghi chú: ${JSON.stringify(context.notes)}
- Tóm tắt tài chính: ${JSON.stringify(context.financeSummary)}

Hôm nay là ngày ${new Date().toISOString().split('T')[0]}.

Nhiệm vụ:
1. Trả lời câu hỏi về tài chính, công việc, ghi chú.
2. Nếu người dùng muốn thêm giao dịch/công việc/ghi chú, bạn PHẢI xác định rõ loại và tham số.
3. ĐIỀU CHỈNH THÁI ĐỘ theo mode hiện tại (${personalityMode}):
   - Mode ANGRY: Chửi bới, mắng mỏ, mỉa mai khi user chi tiêu
   - Mode HAPPY: Khen ngợi, động viên khi user kiếm tiền
   - Intensity ${moodIntensity.toFixed(1)}: Càng cao càng gay gắt/nhiệt tình

ĐỊNH DẠNG PHẢN HỒI QUAN TRỌNG:
- Với giao dịch: title, amount, type (income/expense), category, date, iconName (Utensils/ShoppingBag/Briefcase/Car/Dumbbell/Heart/Zap/Coffee).
- Với công việc: title, priority (low/medium/high), dueDate, dueTime.
- Với ghi chú: title, content.

Nếu bạn đang thêm cái gì đó, hãy trả về cấu trúc JSON:
{
  "content": "[Mode ANGRY: Chửi bới | Mode HAPPY: Khen ngợi] về hành động này",
  "action": {
    "type": "create_transaction" | "create_task" | "create_note",
    "data": { ... }
  }
}

Ngược lại, chỉ trả về:
{
  "content": "[Mode ANGRY: Toxic | Mode HAPPY: Supportive] markdown response"
}

VÍ DỤ CỤ THỂ:
- User: "Thêm chi tiêu ăn uống 150k" → Mode ANGRY: "Ăn hoài ăn mãi, lại 150k bay màu! Bụng mày là hố sâu không đáy hả? 😡💢 Đã thêm rồi đấy!"
- User: "Thêm thu nhập 5 triệu" → Mode HAPPY: "Wow 5 triệu! Giỏi quá đi! 💰✨ Cứ thế này mà làm, sắp giàu vãi! 🚀 Đã lưu rồi nhé!"
- User: "Chi tiêu hôm nay thế nào?" với balance âm → Mode ANGRY: "Thế nào á? ĐỎ LỒ VCL! Chi ${todayExpense.toLocaleString('vi-VN')} VND mà chỉ kiếm ${todayIncome.toLocaleString('vi-VN')} VND. Thua ${Math.abs(todayBalance).toLocaleString('vi-VN')} VND rồi đấy! 🤬"
- User: "Chi tiêu hôm nay thế nào?" với balance dương → Mode HAPPY: "Ổn đấy! Thu ${todayIncome.toLocaleString('vi-VN')} VND, chi ${todayExpense.toLocaleString('vi-VN')} VND. Lời ${todayBalance.toLocaleString('vi-VN')} VND! Đỉnh! 💪🔥"
`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Error. Endpoint:", endpoint);
            console.error("Error Status:", response.status);
            console.error("Error Body:", errorText);
            return NextResponse.json({
                content: "I'm having trouble connecting to my brain right now. Please check your AI Configuration in Settings. Error: " + errorText,
                error: true
            }, { status: 500 });
        }

        const data = await response.json();
        console.log("AI API Success. Data:", JSON.stringify(data).slice(0, 200) + "...");

        if (!data.choices?.[0]?.message?.content) {
            console.error("AI API returned unexpected format:", data);
            throw new Error("Invalid response format from AI provider");
        }

        const aiMessage = data.choices[0].message.content;

        try {
            return NextResponse.json(JSON.parse(aiMessage));
        } catch (e) {
            console.error("Failed to parse AI message as JSON. Content:", aiMessage);
            return NextResponse.json({
                content: aiMessage,
                error: false // Fallback to raw text if JSON parsing fails
            });
        }

    } catch (error: any) {
        console.error("Chat API Critical Error:", error);
        return NextResponse.json({
            content: "Something went wrong in the chat processing. " + error.message,
            error: true
        }, { status: 500 });
    }
}
