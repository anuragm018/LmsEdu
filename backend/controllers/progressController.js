import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';

// @desc    Toggle lesson completion status
// @route   POST /api/progress/toggle
// @access  Private (Student)
export const toggleLessonProgress = async (req, res) => {
  try {
    const { lesson_id, course_id } = req.body;
    const user_id = req.user._id;

    let progress = await Progress.findOne({ user_id, lesson_id });

    if (progress) {
      progress.complete = !progress.complete;
      progress.complete_at = progress.complete ? new Date() : null;
      await progress.save();
    } else {
      progress = await Progress.create({
        user_id,
        lesson_id,
        course_id,
        complete: true,
        complete_at: new Date()
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get progress details for a course
// @route   GET /api/progress/course/:courseId
// @access  Private (Student)
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user._id;

    const totalLessons = await Lesson.countDocuments({ course_id: courseId });
    const completedProgress = await Progress.find({
      user_id,
      course_id: courseId,
      complete: true
    });

    const completedCount = completedProgress.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const completedLessonIds = completedProgress.map(p => p.lesson_id.toString());

    res.json({
      totalLessons,
      completedCount,
      percentage,
      completedLessonIds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
