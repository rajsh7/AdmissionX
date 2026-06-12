# AdmissionX - World's First Online Admission Portal

A comprehensive Next.js application for managing college admissions, student applications, and institutional partnerships.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment Setup

Create `.env.local` with:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=welcome@admissionx.info
SMTP_PASS=your_app_password

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
CRON_SECRET=your_cron_secret

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication (login, signup, OTP)
│   ├── student/      # Student operations
│   ├── college/      # College operations
│   ├── admin/        # Admin operations
│   └── cron/         # Scheduled jobs
├── dashboard/        # User dashboards
├── colleges/         # College listings
└── components/       # Shared components

lib/
├── email.ts          # Email templates & sender
├── db.ts             # Database connection
├── auth.ts           # Authentication utilities
└── security.ts       # Security middleware
```

## 🎯 Key Features

- **Student Portal**: Application management, document upload, payment processing
- **College Portal**: Application review, admission management, student communication
- **Admin Panel**: User management, college approvals, system monitoring
- **Email Automation**: 20 automated email notifications
- **Document Management**: Secure upload and verification
- **Payment Integration**: Application fee processing
- **Counselling System**: Session scheduling and management
- **Seat Reservation**: Automated seat allocation

## 📚 Documentation

- [Email Integration Guide](./EMAIL_INTEGRATION_COMPLETE.md)
- [Signup/Login Flow](./SIGNUP_LOGIN_FLOW.md)
- [Database Setup](./DATABASE_SETUP.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB
- **Authentication**: JWT
- **Email**: Nodemailer (SMTP)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🔐 Security

- Rate limiting on authentication endpoints
- CSRF protection
- JWT-based authentication
- Secure password hashing (bcrypt)
- Input validation and sanitization
- OTP verification (10 min expiry)
- Activation link system (24 hour expiry)

## 📞 Support

For issues or questions, contact: welcome@admissionx.info
