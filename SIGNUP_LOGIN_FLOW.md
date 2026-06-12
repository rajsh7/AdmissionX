# Signup & Login Flow - Complete Guide

## ✅ Current Implementation (Fixed)

### **Signup Flow**

1. **User Signs Up** (`/api/signup/student`)
   - User enters: name, email, phone, password
   - System validates input
   - Password is hashed with bcrypt
   - 6-digit OTP generated
   - Account created with:
     - `is_active: 0` (inactive)
     - `otp_code: "123456"`
     - `otp_expiry: Date (10 minutes)`
     - `otp_purpose: "signup"`
   - **Email 1 sent**: OTP Verification Email

2. **User Verifies OTP** (`/api/auth/verify-otp`)
   - User enters OTP from email
   - System validates:
     - OTP matches
     - OTP not expired
     - `otp_purpose === "signup"`
   - Activation token generated (32-byte hex)
   - Account updated with:
     - `otp_verified: true`
     - `activation_token: "abc123..."`
     - `activation_token_exp: Date (24 hours)`
     - OTP fields cleared
   - **Email 2 sent**: Registration Successful with Activation Link

3. **User Clicks Activation Link** (`/api/auth/activate?token=abc123`)
   - User clicks "Activate Your Account" button in email
   - System validates:
     - Token exists
     - Token not expired
     - Account not already active
   - Account activated:
     - `is_active: 1`
     - Activation token cleared
   - JWT session created
   - User redirected to dashboard
   - ✅ **User can now access dashboard**

---

### **Login Flow**

1. **User Logs In** (`/api/login/student`)
   - User enters: email, password
   - System validates credentials
   - Checks if account is active (`is_active === 1`)
   - If inactive: Error "Please verify your email"
   - 6-digit OTP generated
   - Account updated with:
     - `otp_code: "654321"`
     - `otp_expiry: Date (10 minutes)`
     - `otp_purpose: "login"`
   - **Email sent**: OTP Verification Email

2. **User Verifies Login OTP** (`/api/auth/verify-login-otp`)
   - User enters OTP from email
   - System validates:
     - OTP matches
     - OTP not expired
     - `otp_purpose === "login"`
   - OTP fields cleared
   - JWT session created
   - ✅ **User logged in successfully**

---

## 📧 Email Sequence

### Signup Journey:
1. **OTP Verification Email** - Contains 6-digit OTP (10 min expiry)
2. **Registration Successful Email** - Contains activation link (24 hour expiry)

### Login Journey:
1. **OTP Verification Email** - Contains 6-digit OTP (10 min expiry)

---

## 🔐 Security Features

- **Two-Factor Verification**: OTP + Activation Link for signup
- **Purpose Validation**: Signup OTPs can't be used for login
- **Time-Limited Tokens**: 
  - OTP: 10 minutes
  - Activation Link: 24 hours
- **Rate Limiting**: 
  - Signup: 5 attempts per 15 minutes
  - Login: 8 attempts per 10 minutes
- **Password Security**: bcrypt with 12 rounds

---

## 🗄️ Database Fields

```javascript
{
  // Account Info
  name: String,
  email: String,
  phone: String,
  password_hash: String,
  is_active: Number, // 0 = inactive, 1 = active
  
  // OTP Fields (temporary)
  otp_code: String | null,
  otp_expiry: Date | null,
  otp_verified: Boolean,
  otp_purpose: String | null, // "signup" or "login"
  
  // Activation Fields (temporary)
  activation_token: String | null,
  activation_token_exp: Date | null,
  
  created_at: Date,
  updated_at: Date
}
```

---

## 🎯 Key Points

1. **Account is NOT active after OTP verification**
   - OTP only verifies email ownership
   - Activation link must be clicked to activate account

2. **Login requires active account**
   - Inactive users get error message
   - Must complete activation first

3. **Separate OTP purposes**
   - Signup OTP: Verifies email, generates activation link
   - Login OTP: Two-factor authentication for active users

4. **Email activation link**
   - Sent in "Registration Successful" email
   - Valid for 24 hours
   - One-time use
   - Automatically logs user in after activation

---

## 🧪 Testing

### Test Signup:
```bash
# 1. Signup
POST /api/signup/student
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "password": "password123",
  "captchaOk": true
}

# 2. Verify OTP
POST /api/auth/verify-otp
{
  "email": "test@example.com",
  "otp": "123456"
}

# 3. Click activation link from email
GET /api/auth/activate?token=abc123...

# ✅ User is now active and logged in
```

### Test Login:
```bash
# 1. Login
POST /api/login/student
{
  "email": "test@example.com",
  "password": "password123"
}

# 2. Verify Login OTP
POST /api/auth/verify-login-otp
{
  "email": "test@example.com",
  "otp": "654321"
}

# ✅ User is now logged in
```

---

## 🐛 Common Issues

### "Please verify your email address before logging in"
- **Cause**: Account not activated (is_active = 0)
- **Solution**: Check email for activation link

### "Invalid OTP purpose"
- **Cause**: Using signup OTP for login or vice versa
- **Solution**: Request new OTP for correct purpose

### "OTP has expired"
- **Cause**: OTP older than 10 minutes
- **Solution**: Request new OTP

### "Token expired"
- **Cause**: Activation link older than 24 hours
- **Solution**: Contact support or resend activation

---

## 📝 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signup/student` | POST | Create account + send OTP |
| `/api/auth/verify-otp` | POST | Verify signup OTP + send activation link |
| `/api/auth/activate` | GET | Activate account via email link |
| `/api/login/student` | POST | Login + send OTP |
| `/api/auth/verify-login-otp` | POST | Verify login OTP + create session |
| `/api/auth/resend-activation` | POST | Resend activation email |

---

## 🔄 Flow Diagram

```
SIGNUP:
User → Signup Form → OTP Email → Verify OTP → Registration Email → Click Activation Link → Dashboard

LOGIN:
User → Login Form → OTP Email → Verify OTP → Dashboard
```

---

## 📞 Support

For issues: welcome@admissionx.info
