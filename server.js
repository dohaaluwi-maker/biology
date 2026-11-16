import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// التحقق من مفتاح Groq ورابط التشغيل
const hasKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasKey ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
}) : null;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

// نقطة استقبال الرسائل وتشغيل نموذج Groq
app.post('/api/chat', async (req, res) => {
    try {
        if (!openai) {
            return res.status(400).json({ error: "مفتاح API غير متوفر في ملف .env" });
        }

        const userMessage = req.body.message || req.body.question || (req.body.messages && req.body.messages[req.body.messages.length - 1]?.content);
        
        if (!userMessage) {
            return res.status(400).json({ error: "اكتب سؤالك أولاً." });
        }

                console.log("1) got question:", userMessage);
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            reasoning_effort: "low",
            max_completion_tokens: 2048,
            messages: [
                { role: "system", content: "أنت BioBuddy، مساعد ذكي وودود متخصص في شرح علم البيولوجيا بطريقة سهلة وبسيطة باللغة العربية. لا تستخدم رموز التنسيق (# أو ** أو |) ولا الجداول، واكتب فقرات قصيرة وخطوات مرقمة." },
                { role: "user", content: userMessage }
            ],
        });

                console.log("2) groq reply:", JSON.stringify(completion.choices[0].message));
        const reply = completion.choices[0].message.content || "تعذّر توليد إجابة، حاول مرة أخرى.";
        res.json({ response: reply, message: reply, reply, answer: reply, text: reply, content: reply });
    } catch (error) {
        console.error("Chat error:", error.message);
        res.status(500).json({ error: "حدث خطأ أثناء الحصول على الإجابة: " + error.message });
    }
});

app.listen(port, () => {
    console.log(`BioBuddy is running at http://localhost:${port}`);
});