import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

const getTutorId = (course) => {
  if (!course) return null;
  const tutorVal = course.tutor || course.instructor_id;
  return tutorVal ? (tutorVal._id ? tutorVal._id.toString() : tutorVal.toString()) : null;
};

// @desc    Create a new course announcement
// @route   POST /api/announcements
// @access  Private (Instructor / Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const { course_id, title, content, priority } = req.body;

    if (!course_id || !title || !content) {
      return res.status(400).json({ message: 'Course, title, and content are required' });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const tutorId = getTutorId(course);

    // Verify ownership
    if (tutorId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only post announcements for your own courses' });
    }

    const announcement = await Announcement.create({
      course_id,
      instructor_id: req.user._id,
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'normal'
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('course_id', 'name thumbnail')
      .populate('instructor_id', 'name avatar');

    // Count recipients
    const studentCount = await Enrollment.countDocuments({ course_id });

    res.status(201).json({
      success: true,
      message: `Announcement broadcasted to ${studentCount} enrolled students`,
      announcement: {
        ...populated.toObject(),
        recipientCount: studentCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcements for a specific course
// @route   GET /api/announcements/course/:courseId
// @access  Public / Enrolled
export const getCourseAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ course_id: req.params.courseId })
      .populate('instructor_id', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all announcements posted by the authenticated instructor
// @route   GET /api/announcements/instructor/all
// @access  Private (Instructor)
export const getInstructorAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ instructor_id: req.user._id })
      .populate('course_id', 'name thumbnail')
      .sort({ createdAt: -1 });

    const populatedWithCounts = await Promise.all(
      announcements.map(async (a) => {
        const recipientCount = a.course_id ? await Enrollment.countDocuments({ course_id: a.course_id._id }) : 0;
        return {
          ...a.toObject(),
          recipientCount
        };
      })
    );

    res.json(populatedWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Instructor / Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.instructor_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcement feed for enrolled student across all their courses
// @route   GET /api/announcements/student/feed
// @access  Private (Student)
export const getStudentAnnouncementsFeed = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user_id: req.user._id }).select('course_id');
    const courseIds = enrollments.map(e => e.course_id);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    const announcements = await Announcement.find({ course_id: { $in: courseIds } })
      .populate('course_id', 'name thumbnail')
      .populate('instructor_id', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
