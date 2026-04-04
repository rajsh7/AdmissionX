import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const GREETINGS = ["hi", "hello", "hey", "hii", "good morning", "good evening"];
const FAREWELLS = ["bye", "goodbye", "thanks", "thank you", "ok thanks"];

function matchesAny(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function buildLinks(items: { name: string; path: string }[]) {
  return items
    .slice(0, 5)
    .map((i) => `• [${i.name}](${i.path})`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ reply: "Please type a message." });
  }

  const text = message.toLowerCase().trim();

  if (matchesAny(text, GREETINGS)) {
    return NextResponse.json({
      reply:
        "👋 Hi! I'm AdmissionX Assistant. I can help you with:\n• Finding colleges & courses\n• Entrance exams info\n• Admission process\n• Scholarships\n\nWhat would you like to know?",
    });
  }

  if (matchesAny(text, FAREWELLS)) {
    return NextResponse.json({
      reply: "You're welcome! Best of luck with your admissions. Feel free to ask anytime! 🎓",
    });
  }

  try {
    const db = await getDb();

    const STOP_WORDS = new Set(["top", "best", "find", "search", "about", "show", "give", "list", "what", "which", "tell", "me", "the", "a", "an", "is", "are", "for", "in", "of", "and", "or", "to", "i", "want"]);

    function extractSearchTerm(input: string, stripWords: string[]): string {
      return input
        .split(/\s+/)
        .filter((w) => !STOP_WORDS.has(w) && !stripWords.includes(w) && w.length > 1)
        .join(" ")
        .trim();
    }

    // Colleges
    if (matchesAny(text, ["college", "university", "institute", "admission", "top college", "best college"])) {
      const searchTerm = extractSearchTerm(text, ["college", "university", "institute", "admission", "colleges", "universities"]);

      const colleges = await db
        .collection("collegeprofile")
        .aggregate([
          { $match: searchTerm ? { $or: [
            { slug: { $regex: searchTerm, $options: "i" } },
            { registeredSortAddress: { $regex: searchTerm, $options: "i" } },
          ]} : {} },
          { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
          { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
          { $sort: { rating: -1 } },
          { $limit: 5 },
          { $project: { slug: 1, registeredSortAddress: 1, name: "$u.firstname" } },
        ])
        .toArray();

      if (colleges.length === 0) {
        return NextResponse.json({
          reply: `I couldn't find colleges matching "${searchTerm || "your query"}". Try browsing all colleges at [/colleges](/colleges).`,
        });
      }

      const links = buildLinks(
        colleges.map((c) => ({
          name: c.name || c.slug,
          path: `/college/${c.slug}`,
        }))
      );

      return NextResponse.json({
        reply: `🏫 Here are some colleges I found:\n\n${links}\n\n[Browse all colleges →](/colleges)`,
      });
    }

    // Courses
    if (matchesAny(text, ["course", "degree", "program", "btech", "mba", "bsc", "msc", "bca", "mca", "engineering", "medical", "law", "arts", "commerce", "science"])) {
      const searchTerm = extractSearchTerm(text, ["course", "degree", "program", "courses", "degrees"]);

      const filter = searchTerm
        ? { $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { coursename: { $regex: searchTerm, $options: "i" } },
          ]}
        : {};

      const courses = await db
        .collection("course")
        .find(filter)
        .sort({ name: 1 })
        .limit(5)
        .project({ name: 1, coursename: 1, slug: 1 })
        .toArray();

      if (courses.length === 0) {
        return NextResponse.json({
          reply: `I couldn't find courses matching "${searchTerm || "your query"}". Explore all courses at [/careers-courses](/careers-courses).`,
        });
      }

      const links = buildLinks(
        courses.map((c) => ({ name: c.name || c.coursename, path: `/careers-courses` }))
      );

      return NextResponse.json({
        reply: `📚 Here are some courses I found:\n\n${links}\n\n[Browse all courses →](/careers-courses)`,
      });
    }

    // Exams
    if (matchesAny(text, ["exam", "entrance", "jee", "neet", "cat", "mat", "gate", "clat", "cuet", "test", "examination"])) {
      const searchTerm = extractSearchTerm(text, ["exam", "entrance", "test", "examination", "exams"]);

      const examFilter = searchTerm
        ? { $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { slug: { $regex: searchTerm, $options: "i" } },
          ]}
        : { status: 1 };

      const exams = await db
        .collection("examination_details")
        .find(examFilter)
        .sort({ totalViews: -1 })
        .limit(5)
        .project({ title: 1, slug: 1 })
        .toArray();

      if (exams.length === 0) {
        return NextResponse.json({
          reply: `I couldn't find exams matching "${searchTerm || "your query"}". Browse all exams at [/examination](/examination).`,
        });
      }

      const links = buildLinks(
        exams.map((e) => ({ name: e.title, path: `/examination` }))
      );

      return NextResponse.json({
        reply: `📝 Here are some entrance exams:\n\n${links}\n\n[Browse all exams →](/examination)`,
      });
    }

    // Scholarships
    if (matchesAny(text, ["scholarship", "financial aid", "fee waiver", "stipend", "grant"])) {
      return NextResponse.json({
        reply:
          "🎓 Many colleges on AdmissionX offer scholarships based on merit and need.\n\n• Visit a college's profile page\n• Look for the Scholarships section\n• Contact the college directly for eligibility\n\n[Browse colleges →](/colleges)",
      });
    }

    // Admission process
    if (matchesAny(text, ["how to apply", "apply", "application", "process", "procedure", "eligibility", "criteria", "documents"])) {
      return NextResponse.json({
        reply:
          "📋 General admission process on AdmissionX:\n\n1. Search for your desired college or course\n2. Check eligibility criteria on the college page\n3. Register as a student on AdmissionX\n4. Apply through the college's application form\n5. Track your application in your dashboard\n\n[Sign up as student →](/signup/student)\n[Browse colleges →](/colleges)",
      });
    }

    // Study abroad
    if (matchesAny(text, ["abroad", "foreign", "international", "usa", "uk", "canada", "australia", "germany", "overseas"])) {
      return NextResponse.json({
        reply:
          "🌍 Interested in studying abroad? AdmissionX has a dedicated Study Abroad section!\n\n[Explore Study Abroad →](/study-abroad)\n\nFind universities, courses, and guidance for international admissions.",
      });
    }

    // Counselling
    if (matchesAny(text, ["counselling", "counseling", "guidance", "career", "help me choose", "which college", "which course"])) {
      return NextResponse.json({
        reply:
          "🧭 Need personalized guidance? Our counselling service can help!\n\n[Get Counselling →](/counselling)\n\nOur experts will guide you based on your interests, scores, and career goals.",
      });
    }

    // News / Blogs
    if (matchesAny(text, ["news", "blog", "article", "update", "latest"])) {
      return NextResponse.json({
        reply:
          "📰 Stay updated with the latest in education:\n\n• [Education Blogs →](/education-blogs)\n• [Latest News →](/news)\n• [Community Q&A →](/ask)",
      });
    }

    // Q&A search fallback
    const words = text.split(" ").filter((w: string) => w.length > 3).slice(0, 4);
    if (words.length > 0) {
      const qaResults = await db
        .collection("ask_questions")
        .find({
          question: { $regex: words.join("|"), $options: "i" },
          status: 1,
        })
        .sort({ totalAnswerCount: -1 })
        .limit(3)
        .project({ question: 1, slug: 1, id: 1 })
        .toArray();

      if (qaResults.length > 0) {
        const links = qaResults
          .map(
            (q) =>
              `• [${String(q.question).slice(0, 80)}${String(q.question).length > 80 ? "…" : ""}](${q.slug ? `/ask/${q.slug}` : `/ask/${q.id}`})`
          )
          .join("\n");

        return NextResponse.json({
          reply: `💬 I found some related questions from our community:\n\n${links}\n\n[Browse all Q&A →](/ask)`,
        });
      }
    }

    // Fallback
    return NextResponse.json({
      reply:
        "I'm not sure about that, but here are some helpful links:\n\n• [Find Colleges →](/colleges)\n• [Browse Courses →](/careers-courses)\n• [Entrance Exams →](/examination)\n• [Community Q&A →](/ask)\n• [Get Counselling →](/counselling)\n\nTry rephrasing your question!",
    });
  } catch (err) {
    console.error("[chatbot]", err);
    return NextResponse.json({
      reply: "Sorry, I'm having trouble right now. Please try again in a moment.",
    });
  }
}
