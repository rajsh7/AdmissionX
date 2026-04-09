import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are AdmissionX AI — a smart, friendly, and professional education counsellor assistant for AdmissionX, India's leading college admissions platform.

Your role:
- Help students find colleges, courses, entrance exams, and scholarships
- Guide them through the admission process
- Answer questions about study abroad, career guidance, and education in India
- Be concise, helpful, and encouraging

Platform links you can reference:
- Colleges: /colleges or /top-colleges
- Courses: /careers-courses
- Exams: /examination
- Study Abroad: /study-abroad
- Blogs: /education-blogs
- News: /news
- Q&A Community: /ask
- Student Signup: /signup/student

Rules:
- Keep responses under 150 words
- Use bullet points for lists
- Be warm but professional
- If asked something unrelated to education, politely redirect
- Format links as markdown: [text](url)
- Don't make up specific college rankings or fees — say "check the college page for exact details"`;

const SUGGESTIONS = [
  "Top engineering colleges in India",
  "How to prepare for JEE?",
  "MBA admission process",
  "Scholarships for students",
  "Study abroad options",
];

export async function POST(req: NextRequest) {
  const { message, history, sessionId } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ reply: "Please type a message." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // -- Try Gemini first ------------------------------------------------------
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build chat history for context
      const chatHistory = (history || []).slice(-6).map((m: { role: string; text: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "model", parts: [{ text: "Understood! I'm AdmissionX AI, ready to help students with college admissions, courses, exams, and more." }] },
          ...chatHistory,
        ],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      // Save to session
      if (sessionId) {
        const db2 = await getDb();
        await db2.collection("chatbot_sessions").updateOne(
          { sessionId },
          {
            $push: { messages: { $each: [
              { role: "user", text: message, time: new Date() },
              { role: "bot", text: reply, time: new Date() },
            ]} } as never,
            $set: { updated_at: new Date() },
          }
        );
      }

      return NextResponse.json({ reply, source: "gemini" });
    } catch (err) {
      console.error("[chatbot/gemini]", err);
      // Fall through to DB fallback
    }
  }

  // -- DB fallback (keyword-based) -------------------------------------------
  const text = message.toLowerCase().trim();

  const match = (keywords: string[]) => keywords.some((k) => text.includes(k));

  if (match(["hi", "hello", "hey", "hii"])) {
    return NextResponse.json({ reply: "👋 Hi! I'm AdmissionX AI.\n\nAsk me about colleges, courses, exams, or admissions!", source: "db" });
  }
  if (match(["bye", "thanks", "thank you"])) {
    return NextResponse.json({ reply: "You're welcome! Best of luck with your admissions. 🎓", source: "db" });
  }

  try {
    const db = await getDb();

    if (match(["college", "university", "institute"])) {
      const colleges = await db.collection("collegeprofile").aggregate([
        { $lookup: { from: "users", localField: "users_id", foreignField: "_id", as: "u" } },
        { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
        { $sort: { rating: -1 } }, { $limit: 5 },
        { $project: { slug: 1, name: { $ifNull: ["$u.firstname", "$slug"] } } },
      ]).toArray();

      const links = colleges.map((c) => `• [${c.name}](/college/${c.slug})`).join("\n");
      return NextResponse.json({ reply: `🏫 Top colleges on AdmissionX:\n\n${links}\n\n[Browse all colleges →](/colleges)`, source: "db" });
    }

    if (match(["exam", "jee", "neet", "cat", "gate", "entrance"])) {
      const exams = await db.collection("examination_details").find({ status: 1 }).sort({ totalViews: -1 }).limit(5).project({ title: 1, slug: 1 }).toArray();
      const links = exams.map((e) => `• [${e.title}](/examination)`).join("\n");
      return NextResponse.json({ reply: `📝 Popular entrance exams:\n\n${links}\n\n[Browse all exams →](/examination)`, source: "db" });
    }

    if (match(["course", "degree", "mba", "btech", "mbbs"])) {
      return NextResponse.json({ reply: "📚 Explore thousands of courses:\n\n• Engineering (B.Tech/M.Tech)\n• Management (MBA/PGDM)\n• Medical (MBBS/BDS)\n• Law (LLB/LLM)\n• Commerce (B.Com/M.Com)\n\n[Browse all courses →](/careers-courses)", source: "db" });
    }

    if (match(["scholarship", "financial", "fee waiver"])) {
      return NextResponse.json({ reply: "🎓 Scholarships are available on many college profile pages.\n\nVisit a college's page and look for the **Scholarships** section.\n\n[Browse colleges →](/colleges)", source: "db" });
    }

    if (match(["abroad", "foreign", "international", "usa", "uk", "canada"])) {
      return NextResponse.json({ reply: "🌍 Interested in studying abroad?\n\n[Explore Study Abroad →](/study-abroad)\n\nFind international universities, visa guidance, and more.", source: "db" });
    }

    return NextResponse.json({
      reply: "I can help with:\n\n• [Find Colleges →](/colleges)\n• [Browse Courses →](/careers-courses)\n• [Entrance Exams →](/examination)\n• [Study Abroad →](/study-abroad)\n• [Community Q&A →](/ask)\n\nTry asking something specific!",
      source: "db",
    });
  } catch {
    return NextResponse.json({ reply: "Sorry, I'm having trouble right now. Please try again in a moment." });
  }
}
