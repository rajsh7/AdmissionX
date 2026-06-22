// ─────────────────────────────────────────────────────────────────────────────
// lib/sms.ts  —  AdmissionX SMS Integration (Omnitech SMS API)
//
// All 42 DLT-registered templates are implemented here.
// Every send is fire-and-forget: failures are logged but never thrown to callers.
// ─────────────────────────────────────────────────────────────────────────────

const SMS_API_URL     = process.env.SMS_API_URL      ?? "https://sms.omnitechintegrators.com/fe/api/v1/multiSend";
const SMS_USERNAME    = process.env.SMS_USERNAME      ?? "sarojent.trans";
const SMS_PASSWORD    = process.env.SMS_PASSWORD      ?? "ySsYA";
const SMS_SENDER_ID   = process.env.SMS_SENDER_ID     ?? "ADMXIN";
const SMS_PE_ID       = process.env.SMS_PE_ID         ?? "1701178065512981587";

// ── Template IDs ─────────────────────────────────────────────────────────────
const TEMPLATES = {
  // ── Student-side ──────────────────────────────────────────────────────────
  WELCOME:                    "1707178134165298177",  // 1
  SIGNUP_OTP:                 "1707178134155981936",  // 2
  PROFILE_INCOMPLETE:         "1707178134589842934",  // 3
  PROFILE_VERIFIED:           "1707178134638836375",  // 4
  PASSWORD_RESET_OTP:         "1707178134787009843",  // 5
  LOGIN_OTP:                  "1707178134798007760",  // 6
  APP_INITIATED:              "1707178134806477269",  // 7
  APP_SUBMITTED:              "1707178134821679028",  // 8
  APP_UNDER_REVIEW:           "1707178134838397359",  // 9
  DOCS_VERIFIED:              "1707178134859355048",  // 18 (re-indexed as 10)
  DOCS_REJECTED:              "1707178135071000864",  // 16
  PAYMENT_SUCCESS:            "1707178135058214792",  // 11/17
  PAYMENT_FAILED:             "1707178135066331067",  // 12
  COUNSELLING_SCHEDULED:      "1707178135145644428",  // 13
  ADMISSION_CONFIRMED:        "1707178135208346061",  // 14
  ENROLLMENT_GENERATED:       "1707178135217373794",  // 15
  SUPPORT_TICKET:             "1707178135234252626",  // 19
  DEADLINE_REMINDER:          "1707178135244899546",  // 20
  MARKETING:                  "1707178135263074669",  // 21
  SEAT_RESERVED_DETAILS:      "1707178158948938873",  // 22
  APP_APPROVED_BY_COLLEGE:    "1707178158917993871",  // 23
  SEAT_RESERVED_ALT:          "1707178158927971632",  // 40
  APP_APPROVED_ALT:           "1707178158943532096",  // 41
  VERIFICATION_FAILED:        "1707178159035666329",  // 35 - kept as defined by DLT
  VERIFICATION_PENDING_STU:   "1707178159066463956",  // 39
  // ── College-side ──────────────────────────────────────────────────────────
  COLLEGE_UPDATE_COURSE:      "1707178159205140534",  // 24
  COLLEGE_REG_RECEIVED:       "1707178159006722207",  // 25
  COLLEGE_LOGIN_ALERT:        "1707178159216137723",  // 26
  COLLEGE_APPROVAL_PENDING:   "1707178159107582071",  // 27
  COLLEGE_ADMISSION_APPROVED: "1707178159119861447",  // 28
  COLLEGE_OTP:                "1707178159230091442",  // 29
  COLLEGE_ENROLLMENT_DONE:    "1707178159237485947",  // 30
  COLLEGE_STATUS_UPDATED:     "1707178159128640593",  // 31
  COLLEGE_VERIFY_OTP:         "1707178158988119081",  // 32
  COLLEGE_NEW_APPLICATION:    "1707178159095010928",  // 33
  COLLEGE_DEADLINE_REMINDER:  "1707178159211420447",  // 34
  COLLEGE_VERIFICATION_FAIL:  "1707178159076056329",  // 35-col
  COLLEGE_PROFILE_LIVE:       "1707178159083282996",  // 36
  COLLEGE_VERIFIED:           "1707178159053666968",  // 37
  COLLEGE_UPDATE_SEATS:       "1707178159199616957",  // 38
  COLLEGE_PARTNERSHIP_RENEW:  "1707178159252697813",  // 42
} as const;

// ── Core sender ───────────────────────────────────────────────────────────────

/**
 * Sends a single SMS via the Omnitech API.
 * Phone number must be a 10-digit Indian mobile (no country code).
 * All errors are caught and logged — never re-thrown.
 */
async function sendSMS(phone: string, templateId: string, text: string): Promise<void> {
  const cleaned = String(phone ?? "").replace(/\D/g, "").slice(-10);
  if (cleaned.length !== 10) {
    console.warn(`[SMS] Invalid phone number skipped: ${phone}`);
    return;
  }

  const url = new URL(SMS_API_URL);
  url.searchParams.set("username",            SMS_USERNAME);
  url.searchParams.set("password",            SMS_PASSWORD);
  url.searchParams.set("unicode",             "false");
  url.searchParams.set("from",                SMS_SENDER_ID);
  url.searchParams.set("to",                  `91${cleaned}`);
  url.searchParams.set("dltContentId",        templateId);
  url.searchParams.set("dltPrincipalEntityId", SMS_PE_ID);
  url.searchParams.set("text",                text);

  try {
    const res = await fetch(url.toString(), { method: "GET" });
    const body = await res.text();
    if (!res.ok) {
      console.error(`[SMS] API error (${res.status}): ${body}`);
    } else {
      console.log(`[SMS] Sent to ${cleaned}: ${body.slice(0, 80)}`);
    }
  } catch (err) {
    console.error("[SMS] Network error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Functions
// ─────────────────────────────────────────────────────────────────────────────

// 1. Welcome — after account activated
// "Welcome on board AdmissionX! Your account has been created successfully.
//  Start your admission journey today. – AdmissionX"
export async function sendSMSWelcome(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.WELCOME,
    "Welcome on board AdmissionX! Your account has been created successfully. Start your admission journey today. - AdmissionX"
  );
}

// 2. Signup OTP
// "Welcome to AdmissionX. Your OTP for login on AdmissionX portal is {#var#}.
//  Valid for 3 minutes. Do not share it with anyone. – AdmissionX"
export async function sendSMSSignupOTP(phone: string, otp: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.SIGNUP_OTP,
    `Welcome to AdmissionX. Your OTP for login on AdmissionX potal is ${otp}. Valid for 3 minutes. Do not share it with anyone. - AdmissionX`
  );
}

// 3. Profile incomplete reminder
// "Your AdmissionX profile is incomplete. Please update your details to
//  proceed with admissions. – AdmissionX"
export async function sendSMSProfileIncomplete(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.PROFILE_INCOMPLETE,
    "Your AdmissionX profile is incomplete. Please update your details to proceed with admissions. - AdmissionX"
  );
}

// 4. Profile verified by admin
// "Congratulations! At AdmissionX Your profile has been verified
//  successfully. – AdmissionX"
export async function sendSMSProfileVerified(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.PROFILE_VERIFIED,
    "Congratulations! At AdmissionX Your profile has been verified successfully. - AdmissionX"
  );
}

// 5. Password reset OTP
// "Your AdmissionX password reset OTP is {#var#}. Valid for 3 minutes. – AdmissionX"
export async function sendSMSPasswordResetOTP(phone: string, otp: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.PASSWORD_RESET_OTP,
    `Your AdmissionX password reset OTP is ${otp}. Valid for 3 minutes. - AdmissionX`
  );
}

// 6. Login OTP
// "Your AdmissionX login OTP is {#var#}. Valid for 3 minutes. – AdmissionX"
export async function sendSMSLoginOTP(phone: string, otp: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.LOGIN_OTP,
    `Your AdmissionX login OTP is ${otp}. Valid for 3 minutes. - AdmissionX`
  );
}

// 7. Application initiated / started
// "Your admission application process has been initiated successfully.
//  Complete all required details to continue. – AdmissionX"
export async function sendSMSApplicationInitiated(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.APP_INITIATED,
    "Your admission application process has been initiated successfully. Complete all required details to continue. - AdmissionX"
  );
}

// 8. Application submitted
// "Congratulations! Your application has been submitted successfully at AdmissionX.
//  Your AdmissionX Application ID: {#var#} – AdmissionX"
export async function sendSMSApplicationSubmitted(phone: string, appRef: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.APP_SUBMITTED,
    `Congratulations! Your application has been submitted successfully at AdmissionX . Your AdmissionX Application ID: ${appRef} - AdmissionX`
  );
}

// 9. Application under review
// "Your AdmissionX application ID {#var#} is currently under review
//  by the institution. – AdmissionX"
export async function sendSMSApplicationUnderReview(phone: string, appRef: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.APP_UNDER_REVIEW,
    `Your AdmissonX application ID ${appRef} is currently under review by the institution. - AdmissionX`
  );
}

// 10. Documents verified
// "Your uploaded documents have been verified successfully at AdmissionX.
//  You may proceed to the next step. – AdmissionX"
export async function sendSMSDocumentsVerified(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.DOCS_VERIFIED,
    "Your uploaded documents have been verified successfully at AdmissionX. You may proceed to the next step. – AdmissionX"
  );
}

// 16. Documents require correction / rejected
// "One or more uploaded documents require correction at AdmissionX portal.
//  Please login and re-upload the requested documents at AdmissionX. – AdmissionX"
export async function sendSMSDocumentsRejected(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.DOCS_REJECTED,
    "One or more uploaded documents require correction at AdmissionX portal. Please login and re-upload the requested documents at AdmissionX. – AdmissionX"
  );
}

// 11. Payment successful
// "Payment of ₹{#var#} received successfully at AdmissionX.
//  Transaction ID: {#var#} Thank you. – AdmissionX"
export async function sendSMSPaymentSuccess(phone: string, amount: string | number, txnId: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.PAYMENT_SUCCESS,
    `Payment of ₹${amount} received successfully at AdmissionX. Transaction ID: ${txnId} Thank you. - AdmissionX`
  );
}

// 12. Payment failed
// "Your payment attempt was unsuccessful at AdmissionX.
//  Please try again or contact support. – AdmissionX"
export async function sendSMSPaymentFailed(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.PAYMENT_FAILED,
    "Your payment attempt was unsuccessful at AdmissionX. Please try again or contact support. - AdmissionX"
  );
}

// 13. Counselling scheduled
// "Your AdmissionX counselling session has been scheduled.
//  Date: {#var#} Time: {#var#} Please login for details. – AdmissionX"
export async function sendSMSCounsellingScheduled(phone: string, date: string, time: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COUNSELLING_SCHEDULED,
    `Your AdmissionX counselling session has been scheduled. Date: ${date} Time: ${time} Please login for details. - AdmissionX`
  );
}

// 14. Admission confirmed
// "Congratulations! Your admission at AdmissionX has been confirmed successfully.
//  Welcome to your academic journey. – AdmissionX"
export async function sendSMSAdmissionConfirmed(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.ADMISSION_CONFIRMED,
    "Congratulations! Your admission at AdmissionX has been confirmed successfully. Welcome to your academic journey. - AdmissionX"
  );
}

// 15. Enrollment number generated
// "Congratulations! Your enrollment number for admission at AdmissionX has been
//  generated successfully. Enrollment No: {#var#} – AdmissionX"
export async function sendSMSEnrollmentGenerated(phone: string, enrollmentNo: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.ENROLLMENT_GENERATED,
    `Congratulations! Your enrollment number for admission at AdmissionX has been generated successfully. Enrollment No: ${enrollmentNo} - AdmissionX`
  );
}

// 19. Support request received
// "AdmissionX has received your support request. Ticket ID: {#var#} Our support team will contact you shortly. – AdmissionX"
export async function sendSMSSupportTicket(phone: string, ticketId: string | number): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.SUPPORT_TICKET,
    `AdmissionX has received your support request. Ticket ID: ${ticketId} Our support team will contact you shortly. – AdmissionX`
  );
}

// 20. Admission deadline reminder
// "Reminder: Admission deadline is approaching at AdmissionX. Complete your application before the last date. – AdmissionX"
export async function sendSMSDeadlineReminder(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.DEADLINE_REMINDER,
    "Reminder: Admission deadline is approaching at AdmissionX. Complete your application before the last date. – AdmissionX"
  );
}

// 21. Marketing message
// "The world's first online admission portal AdmissionX connecting students with leading institutions. Your future starts here. – AdmissionX"
export async function sendSMSMarketing(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.MARKETING,
    "The world's first online admission portal AdmissionX connecting students with leading institutions. Your future starts here. – AdmissionX"
  );
}

// 22. Seat reserved details
// "Congratulations! A seat has been reserved for you at AdmissionX. Course: {#var#} College: {#var#} – AdmissionX"
export async function sendSMSSeatReservedDetails(phone: string, course: string, college: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.SEAT_RESERVED_DETAILS,
    `Congratulations! A seat has been reserved for you at AdmissionX. Course: ${course} College: ${college} – AdmissionX`
  );
}

// 23. Application approved by college
// "Congratulations! Your application at AdmissionX has been approved by {#var#}. Please complete the remaining admission formalities. – AdmissionX"
export async function sendSMSAppApprovedByCollege(phone: string, collegeName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.APP_APPROVED_BY_COLLEGE,
    `Congratulations! Your application at AdmissionX has been approved by ${collegeName}. Please complete the remaining admission formalities. – AdmissionX`
  );
}

// 24. College update course details
// "Kindly review and update course details on your AdmissionX dashboard. – AdmissionX"
export async function sendSMSCollegeUpdateCourse(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_UPDATE_COURSE,
    "Kindly review and update course details on your AdmissionX dashboard. – AdmissionX"
  );
}

// 25. College registration received
// "Welcome on board AdmissionX. Your institution registration request has been received and is under verification at AdmissionX. – AdmissionX"
export async function sendSMSCollegeRegReceived(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_REG_RECEIVED,
    "Welcome on board AdmissionX. Your institution registration request has been received and is under verification at AdmissionX. – AdmissionX"
  );
}

// 26. College login alert
// "A successful login was detected on your AdmissionX institution account. If this was not you, contact support immediately. – AdmissionX"
export async function sendSMSCollegeLoginAlert(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_LOGIN_ALERT,
    "A successful login was detected on your AdmissionX institution account. If this was not you, contact support immediately. – AdmissionX"
  );
}

// 27. College admission approval pending
// "Admission approval pending at AdmissionX. Application ID: {#var#} Student: {#var#} Please update admission status. – AdmissionX"
export async function sendSMSCollegeApprovalPending(phone: string, appId: string, studentName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_APPROVAL_PENDING,
    `Admission approval pending at AdmissionX. Application ID: ${appId} Student: ${studentName} Please update admission status. – AdmissionX`
  );
}

// 28. College admission approved successfully
// "Admission approved successfully at AdmissionX. Application ID: {#var#} Student has been notified. – AdmissionX"
export async function sendSMSCollegeAdmissionApproved(phone: string, appId: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_ADMISSION_APPROVED,
    `Admission approved successfully at AdmissionX. Application ID: ${appId} Student has been notified. – AdmissionX`
  );
}

// 29. College OTP
// "Your AdmissionX institution OTP is {#var#}. Valid for {#var#} minutes. Do not share this OTP. – AdmissionX"
export async function sendSMSCollegeOTP(phone: string, otp: string, validMinutes: string | number): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_OTP,
    `Your AdmissionX institution OTP is ${otp}. Valid for ${validMinutes} minutes. Do not share this OTP. – AdmissionX`
  );
}

// 30. College student enrollment completed successfully
// "Student enrollment completed successfully at AdmissionX. Enrollment No: {#var#} Application ID: {#var#} – AdmissionX"
export async function sendSMSCollegeEnrollmentDone(phone: string, enrollNo: string, appId: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_ENROLLMENT_DONE,
    `Student enrollment completed successfully at AdmissionX. Enrollment No: ${enrollNo} Application ID: ${appId} – AdmissionX`
  );
}

// 31. College admission status updated
// "Admission status updated at AdmissionX for Application ID {#var#}. Student notification has been sent. – AdmissionX"
export async function sendSMSCollegeStatusUpdated(phone: string, appId: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_STATUS_UPDATED,
    `Admission status updated at AdmissionX for Application ID ${appId}. Student notification has been sent. – AdmissionX`
  );
}

// 32. College verify OTP
// "Your AdmissionX institution verification OTP is {#var#}. Valid for {#var#} minutes. Do not share it with anyone. – AdmissionX"
export async function sendSMSCollegeVerifyOTP(phone: string, otp: string, validMinutes: string | number): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_VERIFY_OTP,
    `Your AdmissionX institution verification OTP is ${otp}. Valid for ${validMinutes} minutes. Do not share it with anyone. – AdmissionX`
  );
}

// 33. College new application received
// "New student application received at AdmissionX. Application ID: {#var#} Student: {#var#} Please review on AdmissionX. – AdmissionX"
export async function sendSMSCollegeNewApplication(phone: string, appId: string, studentName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_NEW_APPLICATION,
    `New student application received at AdmissionX. Application ID: ${appId} Student: ${studentName} Please review on AdmissionX. – AdmissionX`
  );
}

// 34. College deadline reminder
// "Reminder: At AdmissionX Admission review and confirmation deadlines are approaching. Please process pending applications. – AdmissionX"
export async function sendSMSCollegeDeadlineReminder(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_DEADLINE_REMINDER,
    "Reminder: At AdmissionX Admission review and confirmation deadlines are approaching. Please process pending applications. – AdmissionX"
  );
}

// 35-col. College verification failed
// "Verification of {#var#} could not be completed at AdmissionX. Please upload the required documents. – AdmissionX"
export async function sendSMSCollegeVerificationFail(phone: string, docName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_VERIFICATION_FAIL,
    `Verification of ${docName} could not be completed at AdmissionX. Please upload the required documents. – AdmissionX`
  );
}

// 36. College profile live
// "Congratulations! Your institution profile is now live on AdmissionX and visible to prospective students. – AdmissionX"
export async function sendSMSCollegeProfileLive(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_PROFILE_LIVE,
    "Congratulations! Your institution profile is now live on AdmissionX and visible to prospective students. – AdmissionX"
  );
}

// 37. College verified
// "Congratulations! {#var#} has been verified successfully on AdmissionX. You may now start receiving student applications. – AdmissionX"
export async function sendSMSCollegeVerified(phone: string, institutionName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_VERIFIED,
    `Congratulations! ${institutionName} has been verified successfully on AdmissionX. You may now start receiving student applications. – AdmissionX`
  );
}

// 38. College update seats capacity
// "Please update seat availability and admission capacity at AdmissionX for the current academic session. – AdmissionX"
export async function sendSMSCollegeUpdateSeats(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_UPDATE_SEATS,
    "Please update seat availability and admission capacity at AdmissionX for the current academic session. – AdmissionX"
  );
}

// 39. Verification pending due to incomplete info (student)
// "Verification of {#var#} is pending at AdmissionX due to incomplete information. Please login and update the required details. – AdmissionX"
export async function sendSMSVerificationPending(phone: string, docName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.VERIFICATION_PENDING_STU,
    `Verification of ${docName} is pending at AdmissionX due to incomplete information. Please login and update the required details. – AdmissionX`
  );
}

// 40. Seat reserved alt
// "Congratulations! A seat has been reserved for you in {#var#} at {#var#} at AdmissionX. – AdmissionX"
export async function sendSMSSeatReservedAlt(phone: string, course: string, college: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.SEAT_RESERVED_ALT,
    `Congratulations! A seat has been reserved for you in ${course} at ${college} at AdmissionX. – AdmissionX`
  );
}

// 41. Application approved alt
// "Congratulations! Your AdmissionX application for {#var#} has been approved by AdmissionX. Please complete the remaining admission formalities. – AdmissionX"
export async function sendSMSAppApprovedAlt(phone: string, course: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.APP_APPROVED_ALT,
    `Congratulations! Your AdmissionX application for ${course} has been approved by AdmissionX. Please complete the remaining admission formalities. – AdmissionX`
  );
}

// 42. College partnership renew
// "Your AdmissionX institutional partnership is due for renewal. Please login to complete the renewal process. – AdmissionX"
export async function sendSMSCollegePartnershipRenew(phone: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.COLLEGE_PARTNERSHIP_RENEW,
    "Your AdmissionX institutional partnership is due for renewal. Please login to complete the renewal process. – AdmissionX"
  );
}

// 35. Verification failed / could not be completed (student)
// "Verification of {#var#} could not be completed at AdmissionX. Please upload the required documents. – AdmissionX"
export async function sendSMSVerificationFailed(phone: string, docName: string): Promise<void> {
  await sendSMS(
    phone,
    TEMPLATES.VERIFICATION_FAILED,
    `Verification of ${docName} could not be completed at AdmissionX. Please upload the required documents. – AdmissionX`
  );
}

