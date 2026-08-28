import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
    await mongoose.connect(connStr);
    console.log('[Seeder] Connected to database');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('[Seeder] Cleared old data');

    // Create Default Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@edusphere.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      phone_no: '+19998887770',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'EduSphere Lead Platform Administrator'
    });

    const instructor = await User.create({
      name: 'Prof. Alex Morgan',
      email: 'instructor@edusphere.com',
      password: 'inst123',
      role: 'instructor',
      isVerified: true,
      phone_no: '+19998887771',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Senior Full Stack Software Engineer & Educator with 10+ years experience'
    });

    const student = await User.create({
      name: 'Sarah Connor',
      email: 'student@edusphere.com',
      password: 'stud123',
      role: 'student',
      isVerified: true,
      phone_no: '+19998887772',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Aspiring Web Developer & Tech Enthusiast'
    });

    // Create Categories
    const catDev = await Category.create({ name: 'Web Development', description: 'Full stack development with React, Node, Express & MongoDB', icon: 'Code' });
    const catData = await Category.create({ name: 'Data Science & AI', description: 'Machine learning, Python, data analytics, and neural networks', icon: 'Cpu' });
    const catDesign = await Category.create({ name: 'UI/UX Design', description: 'Figma masterclass, wireframing, and interactive design', icon: 'Palette' });
    const catBusiness = await Category.create({ name: 'Business & Cloud', description: 'AWS Cloud, DevOps, Agile management & product strategies', icon: 'Briefcase' });

    // Create Course 1
    const course1 = await Course.create({
      name: 'MERN Stack Mastery 2026: Build Production Apps',
      desc: 'Master MongoDB, Express.js, React, Node.js, JWT Authentication, and MVC Architecture by building real-world enterprise web applications.',
      price: 49.99,
      type: 'paid',
      tutor: instructor._id,
      category: catDev._id,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
      duration: '8 Hours',
      level: 'Intermediate',
      published: true
    });

    // Create Course 2 (Free)
    const course2 = await Course.create({
      name: 'JavaScript Fundamentals & Async Programming',
      desc: 'Comprehensive free course covering ES6+ features, Promises, Async/Await, DOM Manipulation, and modern JavaScript design patterns.',
      price: 0,
      type: 'free',
      tutor: instructor._id,
      category: catDev._id,
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600',
      duration: '3.5 Hours',
      level: 'Beginner',
      published: true
    });

    // Course 1 Syllabus
    const sec1 = await Section.create({ name: '1. Introduction to MVC & Backend Setup', order: 1, course_id: course1._id });
    const sec2 = await Section.create({ name: '2. React Frontend Architecture & State', order: 2, course_id: course1._id });

    const les1 = await Lesson.create({
      course_id: course1._id,
      section_id: sec1._id,
      title: 'Understanding MVC Architecture in Node & Express',
      lesson_order: 1,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      content: 'In this lesson, we break down the Controller, Model, and Router responsibilities in Express.js.',
      duration: '18 mins'
    });

    const les2 = await Lesson.create({
      course_id: course1._id,
      section_id: sec1._id,
      title: 'Connecting Mongoose Schemas & JWT Security Guards',
      lesson_order: 2,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      document_url: '',
      content: 'Learn how to construct robust schemas and protect endpoints with bearer tokens.',
      duration: '22 mins'
    });

    const les3 = await Lesson.create({
      course_id: course1._id,
      section_id: sec2._id,
      title: 'Setting up React Context API for Global Auth',
      lesson_order: 1,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      document_url: '',
      content: 'Building a custom hook `useAuth` to encapsulate JWT session state across components.',
      duration: '25 mins'
    });

    // Quiz for Course 1
    const quiz1 = await Quiz.create({
      course_id: course1._id,
      title: 'MERN Stack & MVC Core Assessment',
      duration: 10,
      total_marks: 20
    });

    await Question.create({
      quiz_id: quiz1._id,
      question: 'What does MVC stand for in backend web application architecture?',
      mark: 10,
      question_type: 'MCQ',
      options: [
        { option_text: 'Model View Controller', is_correct: true },
        { option_text: 'Main Virtual Container', is_correct: false },
        { option_text: 'Module Variable Component', is_correct: false },
        { option_text: 'Memory Vector Connection', is_correct: false }
      ]
    });

    await Question.create({
      quiz_id: quiz1._id,
      question: 'Which HTTP header is typically used to transmit JWT authentication tokens?',
      mark: 10,
      question_type: 'MCQ',
      options: [
        { option_text: 'Authorization: Bearer <token>', is_correct: true },
        { option_text: 'Content-Type: application/jwt', is_correct: false },
        { option_text: 'Accept: token/jwt', is_correct: false },
        { option_text: 'X-Auth-Key', is_correct: false }
      ]
    });

    // Enroll student in Course 1 & Course 2
    await Enrollment.create({ user_id: student._id, course_id: course1._id });
    await Enrollment.create({ user_id: student._id, course_id: course2._id });

    console.log('[Seeder] Database successfully seeded!');
    console.log('--- DEFAULT LOGIN CREDENTIALS ---');
    console.log('Admin:      admin@edusphere.com      / admin123');
    console.log('Instructor: instructor@edusphere.com / inst123');
    console.log('Student:    student@edusphere.com    / stud123');
    console.log('---------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
