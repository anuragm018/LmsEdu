import ChatMessage from '../models/ChatMessage.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get all doubt chat threads for a student
// @route   GET /api/chat/student/threads
// @access  Private (Student)
export const getStudentThreads = async (req, res) => {
  try {
    const studentId = req.user._id;

    // 1. Get all courses the student is enrolled in
    const enrollments = await Enrollment.find({ user_id: studentId }).populate({
      path: 'course_id',
      select: 'name thumbnail tutor',
      populate: {
        path: 'tutor',
        select: 'name email avatar bio'
      }
    });

    // 2. For each course, find the last message and unread count
    const threads = await Promise.all(
      enrollments.map(async (enr) => {
        const course = enr.course_id;
        if (!course || !course.tutor) return null;

        const lastMessage = await ChatMessage.findOne({
          course: course._id,
          student: studentId
        }).sort({ createdAt: -1 });

        const unreadCount = await ChatMessage.countDocuments({
          course: course._id,
          student: studentId,
          sender: { $ne: studentId },
          read: false
        });

        return {
          courseId: course._id,
          courseName: course.name,
          courseThumbnail: course.thumbnail,
          tutor: course.tutor,
          lastMessage: lastMessage ? {
            text: lastMessage.message,
            sender: lastMessage.sender,
            createdAt: lastMessage.createdAt,
            hasAttachments: lastMessage.attachments && lastMessage.attachments.length > 0
          } : null,
          unreadCount,
          updatedAt: lastMessage ? lastMessage.createdAt : enr.createdAt
        };
      })
    );

    // Filter out nulls and sort by latest update
    const validThreads = threads
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(validThreads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all student doubt chat threads for a tutor
// @route   GET /api/chat/tutor/threads
// @access  Private (Instructor/Admin)
export const getTutorThreads = async (req, res) => {
  try {
    const tutorId = req.user._id;

    // 1. Find all courses owned by this tutor
    const myCourses = await Course.find({ tutor: tutorId }).select('_id name thumbnail');
    const courseIds = myCourses.map(c => c._id);

    // 2. Find all distinct students who have messages or enrollments for these courses
    const allMessages = await ChatMessage.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar')
      .populate('course', 'name thumbnail')
      .sort({ createdAt: -1 });

    // Group messages by courseId + studentId
    const threadMap = new Map();

    for (const msg of allMessages) {
      if (!msg.course || !msg.student) continue;
      const key = `${msg.course._id}_${msg.student._id}`;
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          courseId: msg.course._id,
          courseName: msg.course.name,
          courseThumbnail: msg.course.thumbnail,
          student: msg.student,
          lastMessage: {
            text: msg.message,
            sender: msg.sender,
            createdAt: msg.createdAt,
            hasAttachments: msg.attachments && msg.attachments.length > 0
          },
          unreadCount: 0,
          updatedAt: msg.createdAt
        });
      }

      // Count unread if sent by student and unread
      if (!msg.read && msg.sender.toString() === msg.student._id.toString()) {
        const thread = threadMap.get(key);
        thread.unreadCount += 1;
      }
    }

    const threads = Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a specific course & student thread
// @route   GET /api/chat/messages/:courseId/:studentId
// @access  Private
export const getThreadMessages = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const currentUserId = req.user._id;

    // Fetch messages
    const messages = await ChatMessage.find({
      course: courseId,
      student: studentId
    })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 });

    // Mark unread messages sent to current user as read
    await ChatMessage.updateMany(
      {
        course: courseId,
        student: studentId,
        sender: { $ne: currentUserId },
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a doubt message with optional attachments
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { courseId, studentId, tutorId, message, attachments } = req.body;
    const senderId = req.user._id;

    if ((!message || !message.trim()) && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Please provide a message or attachment.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    let finalStudentId = studentId;
    let finalTutorId = tutorId;

    if (req.user.role === 'student') {
      finalStudentId = senderId;
      finalTutorId = course.tutor;
    } else {
      finalTutorId = senderId;
    }

    if (!finalStudentId || !finalTutorId) {
      return res.status(400).json({ message: 'Invalid student or tutor context.' });
    }

    const newMessage = await ChatMessage.create({
      course: courseId,
      student: finalStudentId,
      tutor: finalTutorId,
      sender: senderId,
      message: (message || '').trim(),
      attachments: attachments || [],
      read: false
    });

    const populated = await ChatMessage.findById(newMessage._id)
      .populate('sender', 'name email avatar role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
