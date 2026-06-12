# Database Setup & Migration Guide

## MongoDB Collections

### 1. next_student_signups

**Purpose**: Store student account information with OTP verification

**Schema**:
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  phone: String (unique),
  password_hash: String,
  is_active: Number (0 = inactive, 1 = active),
  
  // OTP Fields
  otp_code: String | null,           // 6-digit OTP
  otp_expiry: Date | null,           // Expiry timestamp
  otp_verified: Boolean,             // Verification status
  otp_purpose: String | null,        // "signup" or "login"
  
  // Activation Fields
  activation_token: String | null,   // Activation link token
  activation_token_exp: Date | null, // Activation link expiry
  
  // Profile reminder
  profile_reminder_sent: Boolean,    // Track if reminder sent
  
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.next_student_signups.createIndex({ email: 1 }, { unique: true })
db.next_student_signups.createIndex({ phone: 1 }, { unique: true })
db.next_student_signups.createIndex({ is_active: 1 })
db.next_student_signups.createIndex({ otp_expiry: 1 })
```

### 2. next_student_profiles

**Purpose**: Extended student profile information

**Schema**:
```javascript
{
  _id: ObjectId,
  student_id: String,
  dob: String,
  gender: String,
  city: String,
  state: String,
  address: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.next_student_profiles.createIndex({ student_id: 1 }, { unique: true })
```

### 3. applications

**Purpose**: Student applications to colleges

**Schema**:
```javascript
{
  _id: ObjectId,
  applicationRef: String (unique),
  studentId: String,
  collegeId: ObjectId,
  collegeName: String,
  courseId: ObjectId | null,
  courseName: String,
  degreeName: String,
  streamName: String,
  fees: Number,
  notes: String | null,
  
  personal_info: Object,
  academic_info: Object,
  payment_info: Object,
  
  status: String,  // "draft", "submitted", "under_review", "approved", "rejected"
  payment_status: String,  // "pending", "paid"
  transaction_id: String | null,
  amount_paid: Number | null,
  
  // Document verification (NEW)
  document_status: String | null,  // "verified", "rejected"
  document_verification_date: Date | null,
  document_rejection_reason: String | null,
  
  // Counselling (NEW)
  counselling_scheduled: Boolean,
  counselling_date: String | null,
  counselling_time: String | null,
  
  // Seat reservation (NEW)
  seat_reserved: Boolean,
  seat_reservation_date: Date | null,
  
  createdAt: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.applications.createIndex({ applicationRef: 1 }, { unique: true })
db.applications.createIndex({ studentId: 1 })
db.applications.createIndex({ collegeId: 1 })
db.applications.createIndex({ status: 1 })
db.applications.createIndex({ payment_status: 1 })
```

### 4. documents

**Purpose**: Store application documents

**Schema**:
```javascript
{
  _id: ObjectId,
  applicationId: ObjectId,
  type: String,  // "10th Marksheet", "12th Marksheet", "ID Proof"
  fileUrl: String
}
```

**Indexes**:
```javascript
db.documents.createIndex({ applicationId: 1 })
```

### 5. counselling_sessions (NEW)

**Purpose**: Track counselling sessions

**Schema**:
```javascript
{
  _id: ObjectId,
  application_id: ObjectId,
  student_id: String,
  date: String,
  time: String,
  venue: String,
  status: String,  // "scheduled", "completed", "cancelled"
  created_at: Date
}
```

**Indexes**:
```javascript
db.counselling_sessions.createIndex({ application_id: 1 })
db.counselling_sessions.createIndex({ student_id: 1 })
db.counselling_sessions.createIndex({ date: 1 })
```

### 6. next_college_signups

**Purpose**: College account information

**Schema**:
```javascript
{
  _id: ObjectId,
  college_name: String,
  email: String (unique),
  phone: String,
  contact_name: String,
  password_hash: String,
  status: String,  // "pending", "approved", "rejected"
  slug: String,
  collegeprofile_id: ObjectId | null,
  approved_at: Date | null,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.next_college_signups.createIndex({ email: 1 }, { unique: true })
db.next_college_signups.createIndex({ status: 1 })
```

---

## Migration Instructions

### Step 1: Run OTP Fields Migration

```bash
# Install dependencies if not already installed
npm install

# Run migration script
npx tsx migrate-otp-fields.ts
```

This will:
- Add OTP fields to all existing student records
- Set default values (null for codes, false for verified)
- Show statistics of updated records

### Step 2: Create Indexes (Optional but Recommended)

Connect to MongoDB and run:

```javascript
// Student indexes
db.next_student_signups.createIndex({ email: 1 }, { unique: true })
db.next_student_signups.createIndex({ phone: 1 }, { unique: true })
db.next_student_signups.createIndex({ is_active: 1 })
db.next_student_signups.createIndex({ otp_expiry: 1 })

// Application indexes
db.applications.createIndex({ applicationRef: 1 }, { unique: true })
db.applications.createIndex({ studentId: 1 })
db.applications.createIndex({ collegeId: 1 })
db.applications.createIndex({ status: 1 })
db.applications.createIndex({ payment_status: 1 })

// Counselling indexes
db.counselling_sessions.createIndex({ application_id: 1 })
db.counselling_sessions.createIndex({ student_id: 1 })
db.counselling_sessions.createIndex({ date: 1 })
```

### Step 3: Verify Migration

```bash
# Check if OTP fields exist
mongo
> use admissionx
> db.next_student_signups.findOne()
```

You should see:
```javascript
{
  ...
  otp_code: null,
  otp_expiry: null,
  otp_verified: false,
  otp_purpose: null,
  ...
}
```

---

## Environment Variables

Ensure these are set in `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/admissionx?retryWrites=true&w=majority
MONGODB_DB=admissionx
```

---

## Backup Before Migration

**IMPORTANT**: Always backup your database before running migrations!

```bash
# Using mongodump
mongodump --uri="your_mongodb_uri" --out=./backup

# Or use MongoDB Atlas backup feature
```

---

## Rollback (If Needed)

If something goes wrong, you can remove OTP fields:

```javascript
db.next_student_signups.updateMany(
  {},
  {
    $unset: {
      otp_code: "",
      otp_expiry: "",
      otp_verified: "",
      otp_purpose: ""
    }
  }
)
```

---

## Testing After Migration

1. **Test Signup Flow**:
   ```bash
   curl -X POST http://localhost:3000/api/signup/student \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","password":"password123","captchaOk":true}'
   ```

2. **Check OTP Email**: Verify OTP email is received

3. **Test OTP Verification**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"123456"}'
   ```

4. **Test Login with OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/login/student \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

---

## Monitoring

Monitor OTP usage:

```javascript
// Count pending OTP verifications
db.next_student_signups.countDocuments({
  otp_code: { $ne: null },
  otp_expiry: { $gt: new Date() }
})

// Count expired OTPs
db.next_student_signups.countDocuments({
  otp_code: { $ne: null },
  otp_expiry: { $lt: new Date() }
})

// Clean up expired OTPs (optional cron job)
db.next_student_signups.updateMany(
  { otp_expiry: { $lt: new Date() } },
  { $unset: { otp_code: "", otp_expiry: "", otp_purpose: "" } }
)
```

---

## Support

If you encounter issues:
1. Check MongoDB connection in `.env.local`
2. Verify database name matches
3. Check server logs for errors
4. Contact: welcome@admissionx.info
