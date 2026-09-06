import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';

// Helper to get tutor ID from course
const getTutorId = (course) => {
  if (!course) return null;
  const tutorVal = course.tutor || course.instructor_id;
  return tutorVal ? (tutorVal._id ? tutorVal._id.toString() : tutorVal.toString()) : null;
};

// @desc    Get detailed student learning analytics for a course
// @route   GET /api/analytics/course/:courseId
// @access  Private (Instructor / Admin)
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const tutorId = getTutorId(course);

    // Authorization check
    if (req.user.role !== 'admin' && tutorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this course' });
    }

    // Get total lessons count
    const totalLessons = await Lesson.countDocuments({ course_id: courseId });
    const totalQuizzes = await Quiz.countDocuments({ course_id: courseId });

    // Get all enrollments for this course
    const enrollments = await Enrollment.find({ course_id: courseId })
      .populate('user_id', 'name email avatar phone_no createdAt')
      .sort({ enrolled_at: -1 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Compute progress for each student
    const studentRoster = await Promise.all(
      enrollments.map(async (enr) => {
        const student = enr.user_id;
        if (!student) return null;

        const completedProgress = await Progress.find({
          course_id: courseId,
          user_id: student._id,
          complete: true
        }).sort({ complete_at: -1 });

        const completedCount = completedProgress.length;
        const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
        
        const lastActive = completedProgress.length > 0 && completedProgress[0].complete_at
          ? completedProgress[0].complete_at
          : enr.enrolled_at || enr.createdAt;

        // Inactive flag: enrolled more than 7 days ago with 0% progress
        const isInactive = percentage === 0 && new Date(enr.enrolled_at || enr.createdAt) < sevenDaysAgo;

        let status = 'not_started';
        if (percentage === 100) status = 'completed';
        else if (percentage > 0) status = 'in_progress';

        return {
          enrollmentId: enr._id,
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            phone_no: student.phone_no
          },
          enrolledAt: enr.enrolled_at || enr.createdAt,
          lastActiveAt: lastActive,
          completedLessons: completedCount,
          totalLessons,
          percentage,
          status,
          isInactive
        };
      })
    );

    // Filter nulls (in case of deleted student accounts)
    const validStudents = studentRoster.filter(s => s !== null);

    const totalStudents = validStudents.length;
    const completedStudents = validStudents.filter(s => s.status === 'completed').length;
    const inProgressStudents = validStudents.filter(s => s.status === 'in_progress').length;
    const notStartedStudents = validStudents.filter(s => s.status === 'not_started').length;
    const inactiveStudents = validStudents.filter(s => s.isInactive).length;

    const totalPercentageSum = validStudents.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgCompletionRate = totalStudents > 0 ? Math.round(totalPercentageSum / totalStudents) : 0;

    res.json({
      course: {
        _id: course._id,
        name: course.name,
        thumbnail: course.thumbnail,
        price: course.price,
        type: course.type
      },
      stats: {
        totalStudents,
        totalLessons,
        totalQuizzes,
        avgCompletionRate,
        completedStudents,
        inProgressStudents,
        notStartedStudents,
        inactiveStudents
      },
      students: validStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get aggregate analytics across all courses for the instructor
// @route   GET /api/analytics/instructor/overview
// @access  Private (Instructor)
export const getInstructorOverview = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({
      $or: [{ tutor: instructorId }, { instructor_id: instructorId }]
    }).select('_id name thumbnail price type');

    let totalEnrollmentsCount = 0;
    const courseStats = [];

    for (const c of courses) {
      const enrollCount = await Enrollment.countDocuments({ course_id: c._id });
      const lessonCount = await Lesson.countDocuments({ course_id: c._id });
      totalEnrollmentsCount += enrollCount;

      courseStats.push({
        _id: c._id,
        name: c.name,
        thumbnail: c.thumbnail,
        enrollments: enrollCount,
        lessons: lessonCount
      });
    }

    res.json({
      totalCourses: courses.length,
      totalEnrollments: totalEnrollmentsCount,
      courses: courseStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
