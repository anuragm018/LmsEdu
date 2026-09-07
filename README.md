# 🌐 EduSphere — Next-Generation Learning Management System (LMS)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge&logo=react)](https://react.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-06b6d4?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-10b981?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47a248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**EduSphere** is a full-featured, enterprise-grade Learning Management System (LMS) designed for modern online education. Built with a sleek dark-mode glassmorphism aesthetic, EduSphere offers tailored workspaces for **Students**, **Tutors**, and **Platform Administrators**, complete with curriculum authoring, real-time multimedia student doubts chat, telemetry analytics, interactive quizzes, automated certification, and account governance.

---

## 📑 Table of Contents

- [Key Features by Role](#-key-features-by-role)
  - [🎓 Student Experience](#-student-experience)
  - [👨‍🏫 Tutor / Instructor Studio](#-tutor--instructor-studio)
  - [🛡️ Administrator Command Center](#️-administrator-command-center)
  - [🤖 AI Learning Assistant](#-ai-learning-assistant)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Database Seeding & Demo Accounts](#3-database-seeding--demo-accounts)
- [REST API Reference](#-rest-api-reference)
- [Security & Governance](#-security--governance)
- [License](#-license)

---

## 🚀 Key Features by Role

### 🎓 Student Experience
* **Course Discovery & Filtering**: Search and filter courses by category, difficulty level (Beginner to Advanced), and price (Free vs. Paid).
* **Interactive Classroom**: Seamless video player supporting local MP4 uploads, downloadable PDF study notes, and instant section-by-section progress tracking.
* **Knowledge Check Quizzes**: Take multiple-choice quizzes per section with immediate score calculation and review feedback.
* **Automated Certificates**: Generate and download verified completion certificates with confetti celebration upon 100% syllabus completion.
* **1-on-1 Student Doubts Desk**: Real-time direct chat with course instructors, featuring image screenshot uploads, PDF attachment previews, and unread counters.
* **Discussions & Ratings**: Leave 1-to-5 star reviews and discussion questions, and view official verified replies from tutors.
* **Announcements Feed**: Real-time notifications and broadcast feeds from instructors highlighting course updates, schedule changes, and alerts.

### 👨‍🏫 Tutor / Instructor Studio
* **Course Curriculum Studio**: Create and structure sections and lessons; upload MP4 videos with auto-calculated duration detection and attach PDF study notes.
* **Interactive Quiz Creator**: Build custom multiple-choice quizzes with flexible options and designate correct answer keys.
* **📊 Student Analytics & Progress Telemetry**:
  * Live course-by-course enrollment roster.
  * Individual student syllabus completion progress bars (`%` + lessons completed).
  * Last activity timestamps to monitor student engagement.
  * Automated **At-Risk Learner Alerts** flagging students with 0% progress after 7+ days.
  * Course aggregate metrics (Total Enrolled, Class Average %, and Course Graduates).
* **⭐ Course Reviews & Rating Management**:
  * Overall course rating average and 5-star distribution breakdown.
  * Public review feed with inline forms to post, edit, or remove official instructor replies.
* **📢 Course Announcements & Student Broadcasts**:
  * Broadcast urgent notices or updates to all enrolled students with priority tags (`📢 Notice`, `✨ Update`, `🚨 Important Alert`).
  * Sent broadcast history with live student recipient delivery counts.
* **Doubts Communication Hub**: Answer incoming student queries, review attached screenshots/code snippets, and send solutions.
* **Revenue & Sales Ledger**: Track course earnings, sales volume, and transaction history.

### 🛡️ Administrator Command Center
* **System Metrics Dashboard**: Real-time overview of total platform users, student/tutor distribution, course catalog count, enrollments, and gross revenue.
* **User Governance & Access Control**:
  * Clear color-coded permanent role badges (🎓 Student, 👨‍🏫 Tutor, 🛡️ Admin).
  * Account status indicators (`🟢 Active` / `🔴 Blocked`).
  * **Instant Block & Unblock**: Revoke or restore platform access with 1 click. Blocked users are immediately locked out of login and active sessions.
  * **Admin Self-Protection**: Safeguards preventing platform administrators from accidentally blocking or deleting their own accounts.
  * Dynamic user search and filter tabs (`All`, `Students`, `Tutors`, `Blocked`).
* **Platform Revenue Ledger**: Auditable log of all processed payment transactions with student, course, payment method, and timestamp details.

### 🤖 AI Learning Assistant
* Powered by Google Gemini API to assist students 24/7 with course questions, code explanations, and study assistance directly in the classroom.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **FX / UI**: Canvas Confetti, Dark-mode Glassmorphism CSS architecture

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) (MP4 videos, documents, avatar images)
- **Mailing Engine**: [Nodemailer](https://nodemailer.com/) with Gmail SMTP

---

## 📂 Project Architecture

```text
LmsEdu/
├── backend/
│   ├── config/             # Database connection & configurations
│   ├── controllers/        # Route controllers (MVC architecture)
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── announcementController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── commentRatingController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── progressController.js
│   │   ├── quizController.js
│   │   ├── syllabusController.js
│   │   └── transactionController.js
│   ├── middleware/         # Auth protection, admin verification & error handling
│   ├── models/             # Mongoose data schemas (User, Course, Progress, etc.)
│   ├── routes/             # RESTful API route definitions
│   ├── uploads/            # Statically served MP4 videos, images & PDF documents
│   ├── utils/              # Database seeder & email dispatch service
│   ├── server.js           # Express app entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI widgets (Navbar, Footer, Modals, Chatbots)
│   │   ├── context/        # Global AuthContext & live state management
│   │   ├── pages/          # Application views
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── LearningRoom.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── VerifyOTP.jsx
│   │   ├── services/       # Axios API client instance & interceptors
│   │   ├── index.css       # Design tokens & glassmorphism theme
│   │   └── App.jsx         # App router & layout container
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for sending verification OTPs).

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/edusphere
   JWT_SECRET=your_super_secret_jwt_key_here

   # Email SMTP (Gmail Configuration)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password
   FROM_NAME=EduSphere LMS
   FROM_EMAIL=your_email@gmail.com

   # Google Gemini AI (Optional)
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will start listening on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to `client/`:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web client will launch at `http://localhost:5173`.*

---

### 3. Database Seeding & Demo Accounts

To populate default categories, sample courses, curriculum lessons, and demo users, run the seeder script from `backend/`:

```bash
npm run seed
```

#### Pre-configured Demo Accounts:
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **🛡️ Administrator** | `admin@edusphere.com` | `admin123` | Full governance, user control, system stats |
| **👨‍🏫 Tutor / Instructor** | `instructor@edusphere.com` | `inst123` | Course studio, analytics, doubts chat, reviews |
| **🎓 Student** | `student@edusphere.com` | `stud123` | Course learning classroom, quizzes, doubts, certs |

---

## 🔌 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register student or tutor account & dispatch OTP | Public |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit registration OTP code | Public |
| `POST` | `/api/auth/resend-otp` | Resend verification email | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT (rejects blocked users) | Public |
| `GET` | `/api/auth/profile` | Fetch authenticated user profile & current role | Private |

### 📚 Courses & Curriculum (`/api/courses`, `/api/syllabus`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | List all published courses with search/category filters | Public |
| `GET` | `/api/courses/:id` | Get comprehensive course details | Public |
| `POST` | `/api/courses` | Create a new course | Private (Instructor) |
| `PUT` | `/api/courses/:id` | Update course metadata | Private (Instructor/Admin) |
| `DELETE` | `/api/courses/:id` | Delete course and associated lessons | Private (Instructor/Admin) |
| `GET` | `/api/syllabus/:courseId` | Get sections and lessons for a course | Public / Enrolled |
| `POST` | `/api/syllabus/section` | Add a new section to a course | Private (Instructor) |
| `POST` | `/api/syllabus/lesson` | Add a lesson (MP4/notes) to a section | Private (Instructor) |
| `PUT` | `/api/syllabus/lesson/:id` | Update lesson title, video, or notes | Private (Instructor) |

### 📊 Learning Analytics (`/api/analytics`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/course/:courseId` | Course student telemetry, progress %, graduates & at-risk count | Private (Instructor/Admin) |
| `GET` | `/api/analytics/instructor/overview` | Aggregate enrollments and lesson statistics across all tutor courses | Private (Instructor) |

### ⭐ Reviews & Comments (`/api/comments`, `/api/ratings`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments/course/:courseId` | Fetch course discussion comments and ratings | Public |
| `POST` | `/api/comments` | Post a comment or rating for a course | Private (Student) |
| `GET` | `/api/comments/instructor/all` | Fetch all reviews across courses owned by tutor | Private (Instructor) |
| `PUT` | `/api/comments/:id/reply` | Post or update an official instructor reply to a review | Private (Instructor) |
| `DELETE` | `/api/comments/:id/reply` | Remove an instructor reply | Private (Instructor) |

### 📢 Course Announcements (`/api/announcements`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/announcements` | Broadcast a new announcement to enrolled students | Private (Instructor) |
| `GET` | `/api/announcements/course/:courseId` | Get announcements for a specific course | Public / Enrolled |
| `GET` | `/api/announcements/instructor/all` | Get all announcements sent by the instructor | Private (Instructor) |
| `GET` | `/api/announcements/student/feed` | Stream announcements for all courses student is enrolled in | Private (Student) |
| `DELETE` | `/api/announcements/:id` | Delete an announcement | Private (Instructor) |

### 🛡️ Administration (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Platform summary metrics (users, revenue, enrollments) | Private (Admin) |
| `GET` | `/api/admin/users` | List all users across the platform | Private (Admin) |
| `PUT` | `/api/admin/users/:id/toggle-block` | Toggle user block/unblock status (with self-block protection) | Private (Admin) |
| `DELETE` | `/api/admin/users/:id` | Permanently remove a user account | Private (Admin) |

### 💬 Doubts Chat Desk (`/api/chat`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat/tutor/threads` | Fetch student doubt threads with unread counts for tutor | Private (Instructor) |
| `GET` | `/api/chat/messages/:courseId/:studentId` | Fetch message exchange between tutor and student | Private |
| `POST` | `/api/chat/send` | Send a text message or multimedia attachment | Private |
| `POST` | `/api/chat/upload` | Upload doubt screenshot or document attachment | Private |

---

## 🔒 Security & Governance

1. **Role Enforcement**: Middleware strictly segregates student, tutor, and admin privileges. Tutors can only access courses they author.
2. **Account Suspension Governance**: When an administrator blocks an account, the user is immediately rejected from logging in with a `403 Forbidden` response, and all active token sessions are invalidated by the authentication middleware.
3. **Admin Self-Protection**: Built-in backend safeguards prevent platform administrators from blocking or deleting their own accounts.
4. **Email Verification**: Registrations require a time-sensitive 6-digit OTP verified through Nodemailer and Gmail SMTP before login is permitted.
5. **Secure Cryptography**: User passwords are encrypted with salted one-way hashes via `bcryptjs`.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute this software for personal or commercial projects.

---

<div align="center">
  <sub>Built with ❤️ for learners and educators worldwide • Powered by <strong>EduSphere</strong></sub>
</div>
