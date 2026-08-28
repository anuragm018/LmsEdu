import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Enroll student in a course
// @route   POST /api/enrollments
// @access  Private (Student)
export const enrollCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user._id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your student email address before enrolling in courses. Check your email for the verification link.' 
      });
    }

    const existing = await Enrollment.findOne({ user_id, course_id });
    if (existing) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      user_id,
      course_id
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user_id: req.user._id })
      .populate({
        path: 'course_id',
        populate: [
          { path: 'tutor', select: 'name email avatar' },
          { path: 'category', select: 'name icon' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if student is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user_id: req.user._id,
      course_id: req.params.courseId
    });

    res.json({ isEnrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
