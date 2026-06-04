import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.url;
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    console.log("[Easebuzz Callback Received]", {
      txnid: data.txnid,
      status: data.status,
      amount: data.amount,
      udf1: data.udf1,
      udf2: data.udf2,
    });

    const studentId = String(data.udf1 || "");
    const applicationId = String(data.udf2 || "");
    const status = String(data.status || "");
    const amount = String(data.amount || "");
    const txnid = String(data.txnid || "");
    const key = String(data.key || "");
    const hash = String(data.hash || "");
    const easepayid = String(data.easepayid || "");
    const errorMessage = String(data.error_Message || "Payment rejected or cancelled.");

    const salt = process.env.EASEBUZZ_SALT || "JSJNP1ZOEC";

    // Reconstruct reverse hash sequence:
    // salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const computedString = `${salt}|${status}|${data.udf10 || ""}|${data.udf9 || ""}|${data.udf8 || ""}|${data.udf7 || ""}|${data.udf6 || ""}|${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${data.email || ""}|${data.firstname || ""}|${data.productinfo || ""}|${amount}|${txnid}|${key}`;
    const computedHash = crypto.createHash("sha512").update(computedString).digest("hex").toLowerCase();

    const isVerified = hash.toLowerCase() === computedHash;

    if (!isVerified) {
      console.error("[Easebuzz Callback] Hash verification failed!", {
        received: hash,
        computed: computedHash,
        string: computedString,
      });

      const redirectUrl = new URL(`/dashboard/student/${studentId || "unknown"}`, baseUrl);
      redirectUrl.searchParams.set("tab", "app-all");
      redirectUrl.searchParams.set("payment", "failed");
      redirectUrl.searchParams.set("reason", "Cryptographic signature validation failed (Possible tampering).");
      return NextResponse.redirect(redirectUrl.toString(), 303);
    }

    const db = await getDb();
    
    // Resolve the application filter
    const appFilter: any = {
      _id: ObjectId.isValid(applicationId) ? new ObjectId(applicationId) : applicationId,
      studentId: studentId,
    };

    if (status === "success") {
      // 1. Update application payment status in the database
      const amountNum = parseFloat(amount);
      const updateResult = await db.collection("applications").updateOne(appFilter, {
        $set: {
          payment_status: "paid",
          transaction_id: txnid,
          amount_paid: isNaN(amountNum) ? 0 : amountNum,
          easepayid: easepayid,
          updated_at: new Date(),
        }
      });

      console.log("[Easebuzz Callback] Application update status:", updateResult.modifiedCount ? "Paid" : "Unchanged");

      // 2. Fire transaction success email asynchronously
      setImmediate(async () => {
        try {
          const studentDoc = await db.collection("next_student_signups").findOne({
            _id: (ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId) as any
          });
          if (studentDoc) {
            await sendPaymentSuccessEmail(
              studentDoc.email,
              studentDoc.name || "Student",
              amount,
              txnid,
              new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            );
          }
        } catch (emailErr) {
          console.error("[Easebuzz Callback] Email notification failed:", emailErr);
        }
      });

      // 3. Redirect back to the student application tab with success parameter
      const redirectUrl = new URL(`/dashboard/student/${studentId}`, baseUrl);
      redirectUrl.searchParams.set("tab", "app-all");
      redirectUrl.searchParams.set("payment", "success");
      redirectUrl.searchParams.set("txnid", txnid);
      return NextResponse.redirect(redirectUrl.toString(), 303);
    } else {
      // Payment Failed or Cancelled
      console.warn("[Easebuzz Callback] Transaction failed:", errorMessage);

      // 1. Update status to failed
      await db.collection("applications").updateOne(appFilter, {
        $set: {
          payment_status: "failed",
          transaction_id: txnid,
          updated_at: new Date(),
        }
      });

      // 2. Fire transaction failed email
      setImmediate(async () => {
        try {
          const studentDoc = await db.collection("next_student_signups").findOne({
            _id: (ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId) as any
          });
          if (studentDoc) {
            await sendPaymentFailedEmail(studentDoc.email, studentDoc.name || "Student");
          }
        } catch (emailErr) {
          console.error("[Easebuzz Callback] Fail email notification failed:", emailErr);
        }
      });

      // 3. Redirect back to student dashboard with error reason
      const redirectUrl = new URL(`/dashboard/student/${studentId}`, baseUrl);
      redirectUrl.searchParams.set("tab", "app-all");
      redirectUrl.searchParams.set("payment", "failed");
      redirectUrl.searchParams.set("reason", errorMessage);
      return NextResponse.redirect(redirectUrl.toString(), 303);
    }
  } catch (error) {
    console.error("[Easebuzz Callback Error]:", error);
    return NextResponse.json({ error: "Callback processing encountered a server error." }, { status: 500 });
  }
}
