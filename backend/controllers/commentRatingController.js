import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';

// @desc    Add comment to course
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { course_id, comment } = req.body;
    const newComment = await Comment.create({
      course_id,
      comment,
      user_id: req.user._id
    });

    const populated = await Comment.findById(newComment._id).populate('user_id', 'name avatar role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for course
// @route   GET /api/comments/course/:courseId
// @access  Public
export const getCourseComments = async (req, res) => {
  try {
    const comments = await Comment.find({ course_id: req.params.courseId })
      .populate('user_id', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or update rating for course
// @route   POST /api/ratings
// @access  Private (Student)
export const addRating = async (req, res) => {
  try {
    const { course_id, rating } = req.body;
    const user_id = req.user._id;

    let existing = await Rating.findOne({ user_id, course_id });
    if (existing) {
      existing.rating = rating;
      await existing.save();
      return res.json(existing);
    }

    const newRating = await Rating.create({
      course_id,
      rating,
      user_id
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rating summary for course
// @route   GET /api/ratings/course/:courseId
// @access  Public
export const getCourseRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ course_id: req.params.courseId });
    const count = ratings.length;
    const avg = count > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;

    res.json({
      averageRating: parseFloat(avg),
      totalRatings: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
