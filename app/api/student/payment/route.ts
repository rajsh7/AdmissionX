import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { sendPaymentSuccessEmail, sendCollegeStudentEnrolledEmail } from "@/lib/email";
import { sendSMSPaymentSuccess } from "@/lib/sms";

async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

function getRequestOrigin(req: NextRequest): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (siteUrl && !siteUrl.includes("0.0.0.0")) {
    return siteUrl.replace(/\/+$/, "");
  }
  const host = req.headers.get("host");
  if (host && (host.includes("localhost") || host.includes("127.0.0.1"))) {
    return `http://${host}`;
  }
  return "https://admissionx.com";
}

export async function POST(req: NextRequest) {
  let body: {
    student_id?: number | string;
    application_id?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { student_id, application_id } = body;

  if (!student_id) return NextResponse.json({ error: "student_id is required." }, { status: 400 });
  if (!application_id) return NextResponse.json({ error: "application_id is required." }, { status: 400 });

  const payload = await checkAuth(String(student_id));
  if (!payload) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const db = await getDb();
  
  // Safely resolve the application ID (string or ObjectId)
  const appFilter: any = {
    _id: ObjectId.isValid(application_id) ? new ObjectId(application_id) : application_id,
    studentId: String(student_id),
  };

  const app = await db.collection("applications").findOne(appFilter);

  if (!app) return NextResponse.json({ error: "Application not found or does not belong to this student." }, { status: 404 });
  if (app.payment_status === "paid") return NextResponse.json({ error: "This application has already been paid for.", payment_url: null }, { status: 409 });
  if (app.status === "rejected") return NextResponse.json({ error: "Cannot process payment for a rejected application." }, { status: 409 });

  // Calculate verified fee strictly server-side
  let verifiedFee = 0;
  if (app.fees !== undefined && app.fees !== null && !isNaN(Number(app.fees))) {
    verifiedFee = Number(app.fees);
  } else if (app.courseId) {
    const cm = await db.collection("collegemaster").findOne({ _id: app.courseId }, { projection: { fees: 1 } });
    if (cm && cm.fees && !isNaN(Number(cm.fees))) {
      verifiedFee = Number(cm.fees);
    }
  }

  const amountNum = verifiedFee;
  if (isNaN(amountNum) || amountNum < 0) {
    return NextResponse.json({ error: "Application amount must be a positive number or zero." }, { status: 400 });
  }

  // Retrieve student details to prefill payment form
  const studentIdStr = String(student_id);
  const studentDoc = await db.collection("next_student_signups").findOne({
    _id: (ObjectId.isValid(studentIdStr) ? new ObjectId(studentIdStr) : studentIdStr) as any
  });

  if (amountNum === 0) {
    // 0-fee (free) application bypass
    const freeTxnid = `ADX-FREE-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    
    // Update application to paid
    await db.collection("applications").updateOne(appFilter, {
      $set: {
        payment_status: "paid",
        transaction_id: freeTxnid,
        amount_paid: 0,
        updated_at: new Date(),
      }
    });

    // Send payment success email (free application receipt)
    const emailToUse = app.personal_info?.email || studentDoc?.email || "";
    const nameToUse = app.personal_info?.name || studentDoc?.name || "Student";
    const collegeName = app.college_name || "AdmissionX College";
    const courseName = [app.degree_name, app.course_name].filter(Boolean).join(" - ") || "Application Fee";
    const appRef = app.applicationRef || app.application_ref || "APP-2026-88094";
    
    if (emailToUse) {
      try {
        await sendPaymentSuccessEmail(
          emailToUse,
          nameToUse,
          "0.00",
          freeTxnid,
          new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          collegeName,
          courseName,
          appRef
        );
      } catch (emailErr) {
        console.error("[Free Payment Bypass] Email notification failed:", emailErr);
      }
    }

    // Send Free Bypass SMS to Student
    try {
      const studentPhone = app.personal_info?.phone || studentDoc?.phone;
      if (studentPhone) {
        await sendSMSPaymentSuccess(studentPhone, "0.00", freeTxnid);
      }
    } catch (smsErr) {
      console.error("[Free Payment Bypass] SMS notification failed:", smsErr);
    }

    // Notify College
    if (app.collegeId) {
      try {
        const colId = typeof app.collegeId === "string" && ObjectId.isValid(app.collegeId)
          ? new ObjectId(app.collegeId)
          : app.collegeId;

        const collegeDoc = await db.collection("collegeprofile").aggregate([
          { $match: { _id: colId } },
          { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "u" } },
          { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
          { $project: { email: "$u.email", name: "$u.firstname" } },
          { $limit: 1 },
        ]).toArray();

        if (collegeDoc.length && collegeDoc[0].email) {
          await sendCollegeStudentEnrolledEmail(
            collegeDoc[0].email,
            collegeDoc[0].name || collegeName,
            nameToUse,
            appRef,
            courseName,
            "0.00",
            freeTxnid
          );
        }
      } catch (collegeErr) {
        console.error("[Free Payment Bypass] College enrollment email notification failed:", collegeErr);
      }
    }

    return NextResponse.json({
      success: true,
      payment_url: `/dashboard/student/${student_id}?tab=app-all&payment=success&txnid=${freeTxnid}`,
      txnid: freeTxnid,
    });
  }

  const firstname = (app.personal_info?.name || studentDoc?.name || "Student").trim();
  const email = (app.personal_info?.email || studentDoc?.email || "").trim();
  
  // Clean phone number (must be 10 digits without spaces or country code)
  let rawPhone = app.personal_info?.phone || studentDoc?.phone || "9999999999";
  const phone = rawPhone.replace(/\D/g, "").slice(-10);

  const productinfo = [app.degreeName, app.courseName].filter(Boolean).join(" ").trim() || "College Application Fee";
  const txnid = `ADX-TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Configure URLs
  const origin = getRequestOrigin(req);
  const surl = `${origin}/api/student/payment/callback`;
  const furl = `${origin}/api/student/payment/callback`;

  // Easebuzz Credentials
  const key = process.env.EASEBUZZ_KEY;
  const salt = process.env.EASEBUZZ_SALT;
  const env = process.env.EASEBUZZ_ENV || (process.env.NODE_ENV === "production" ? "prod" : "test");

  if (!key || !salt) {
    console.error("[Easebuzz Initiate] EASEBUZZ_KEY or EASEBUZZ_SALT environment variable is missing.");
    return NextResponse.json({ error: "Payment gateway configuration error." }, { status: 500 });
  }

  // User Defined Fields (UDF) returned on payment callback
  const udf1 = String(student_id);
  const udf2 = String(application_id);
  const udf3 = String(app.applicationRef || app.application_ref || "");
  const udf4 = String(app.collegeName || app.college_name || "College");
  const udf5 = String(app.courseName || app.course_name || "Course");

  // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
  const hashString = `${key}|${txnid}|${amountNum.toFixed(2)}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();

  // Initiate Payment API Endpoint
  const initiateUrl = env === "prod"
    ? "https://pay.easebuzz.in/payment/initiateLink"
    : "https://testpay.easebuzz.in/payment/initiateLink";

  const requestBody = new URLSearchParams({
    key,
    txnid,
    amount: amountNum.toFixed(2),
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    hash,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
  });

  try {
    const response = await fetch(initiateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody.toString(),
    });

    const responseText = await response.text();
    let result: { status: number; data: string };

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("[Easebuzz Initiate] Parsing failed. Response text:", responseText);
      return NextResponse.json({ error: "Invalid response format from payment gateway." }, { status: 502 });
    }

    if (result.status === 1) {
      const accessKey = result.data;
      const checkoutUrl = env === "prod"
        ? `https://pay.easebuzz.in/pay/${accessKey}`
        : `https://testpay.easebuzz.in/pay/${accessKey}`;

      // Update application transaction attempt details
      await db.collection("applications").updateOne(appFilter, {
        $set: {
          transaction_id: txnid,
          payment_gateway: "easebuzz",
          updated_at: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        payment_url: checkoutUrl,
        txnid,
      });
    } else {
      console.error("[Easebuzz Initiate] Error details:", result.data || result);
      return NextResponse.json({
        error: "Failed to initiate Easebuzz payment gateway.",
        details: result.data || result,
      }, { status: 400 });
    }
  } catch (error) {
    console.error("[Easebuzz Connection Error]:", error);
    return NextResponse.json({ error: "Connection error with payment gateway." }, { status: 503 });
  }
}
