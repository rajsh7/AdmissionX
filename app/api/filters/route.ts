import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();

    const [countries, cities, degrees, courses] = await Promise.all([
      db.collection("country").find({ name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(200).project({ _id: 1, name: 1 }).toArray(),
      db.collection("city").find({ name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(300).project({ _id: 1, name: 1 }).toArray(),
      db.collection("degree").find({ name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(100).project({ _id: 1, name: 1 }).toArray(),
      db.collection("course").find({ name: { $exists: true, $ne: "" } }).sort({ name: 1 }).limit(200).project({ _id: 1, name: 1 }).toArray(),
    ]);

    const states = [
      { id: 1, name: "Andhra Pradesh" }, { id: 2, name: "Delhi" },
      { id: 3, name: "Gujarat" }, { id: 4, name: "Karnataka" },
      { id: 5, name: "Kerala" }, { id: 6, name: "Madhya Pradesh" },
      { id: 7, name: "Maharashtra" }, { id: 8, name: "Punjab" },
      { id: 9, name: "Rajasthan" }, { id: 10, name: "Tamil Nadu" },
      { id: 11, name: "Telangana" }, { id: 12, name: "Uttar Pradesh" },
      { id: 13, name: "West Bengal" },
    ];

    return NextResponse.json({ success: true, data: { countries, states, cities, degrees, courses } });
  } catch (error) {
    console.error("Filter API error:", error);
    return NextResponse.json({
      success: false,
      data: {
        countries: [{ id: 1, name: "India" }],
        states: [{ id: 1, name: "Maharashtra" }],
        cities: [{ id: 1, name: "Mumbai" }],
        degrees: [{ id: 1, name: "Bachelor" }],
        courses: [{ id: 1, name: "Computer Science" }],
      },
    });
  }
}
