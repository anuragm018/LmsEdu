import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetails } from './pages/CourseDetails';
import { LearningRoom } from './pages/LearningRoom';
import { QuizPage } from './pages/QuizPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { StudentDoubtsPage } from './pages/StudentDoubtsPage';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/doubts" element={<StudentDoubtsPage />} />
            <Route path="/learn/:courseId" element={<LearningRoom />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
          </Route>

          {/* Instructor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
            <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
