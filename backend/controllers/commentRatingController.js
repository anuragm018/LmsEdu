import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';
import Course from '../models/Course.js';

const getTutorId = (course) => {
  if (!course) return null;
  const tutorVal = course.tutor || course.instructor_id;
  return tutorVal ? (tutorVal._id ? tutorVal._id.toString() : tutorVal.toString()) : null;
};

// @desc    Add comment/review to course
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { course_id, comment, rating } = req.body;
    const newComment = await Comment.create({
      course_id,
      comment,
      rating: rating || 5,
      user_id: req.user._id
    });

    const populated = await Comment.findById(newComment._id)
      .populate('user_id', 'name avatar role')
      .populate('reply.instructor_id', 'name avatar role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments/reviews for course
// @route   GET /api/comments/course/:courseId
// @access  Public
export const getCourseComments = async (req, res) => {
  try {
    const comments = await Comment.find({ course_id: req.params.courseId })
      .populate('user_id', 'name avatar role')
      .populate('reply.instructor_id', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews across courses owned by the instructor
// @route   GET /api/comments/instructor/all
// @access  Private (Instructor)
export const getInstructorReviews = async (req, res) => {
  try {
    const instructorCourses = await Course.find({
      $or: [{ tutor: req.user._id }, { instructor_id: req.user._id }]
    }).select('_id name thumbnail');
    const courseIds = instructorCourses.map(c => c._id);

    const reviews = await Comment.find({ course_id: { $in: courseIds } })
      .populate('user_id', 'name email avatar')
      .populate('course_id', 'name thumbnail price')
      .populate('reply.instructor_id', 'name avatar')
      .sort({ createdAt: -1 });

    // Analytics summary
    const totalReviews = reviews.length;
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    reviews.forEach(r => {
      const star = r.rating || 5;
      ratingSum += star;
      if (ratingBreakdown[star] !== undefined) {
        ratingBreakdown[star] += 1;
      }
    });

    const avgRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '5.0';

    res.json({
      reviews,
      stats: {
        totalReviews,
        avgRating: parseFloat(avgRating),
        ratingBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Instructor reply to a student review/comment
// @route   PUT /api/comments/:id/reply
// @access  Private (Instructor)
export const replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const comment = await Comment.findById(req.params.id).populate('course_id');
    if (!comment) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify instructor ownership
    const tutorId = getTutorId(comment.course_id);
    const isOwner = tutorId === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only reply to reviews on your own courses' });
    }

    comment.reply = {
      text: text.trim(),
      replied_at: new Date(),
      instructor_id: req.user._id
    };

    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate('user_id', 'name email avatar')
      .populate('course_id', 'name thumbnail')
      .populate('reply.instructor_id', 'name avatar');

    res.json({
      success: true,
      message: 'Reply posted successfully',
      comment: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an instructor reply
// @route   DELETE /api/comments/:id/reply
// @access  Private (Instructor)
export const deleteCommentReply = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('course_id');
    if (!comment) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const tutorId = getTutorId(comment.course_id);
    const isOwner = tutorId === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    comment.reply = undefined;
    await comment.save();

    res.json({ success: true, message: 'Reply removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or update rating for course or specific section
// @route   POST /api/ratings
// @access  Private (Student)
export const addRating = async (req, res) => {
  try {
    const { course_id, section_id, rating } = req.body;
    const user_id = req.user._id;

    const query = { user_id, course_id };
    if (section_id) {
      query.section_id = section_id;
    }

    let existing = await Rating.findOne(query);
    if (existing) {
      existing.rating = rating;
      await existing.save();
      return res.json(existing);
    }

    const newRating = await Rating.create({
      course_id,
      section_id: section_id || undefined,
      rating,
      user_id
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rating summary for course & user section ratings
// @route   GET /api/ratings/course/:courseId
// @access  Public
export const getCourseRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ course_id: req.params.courseId });
    const count = ratings.length;
    const avg = count > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0;

    let userSectionRatings = {};
    if (req.user) {
      const userRatings = await Rating.find({ course_id: req.params.courseId, user_id: req.user._id });
      userRatings.forEach(r => {
        if (r.section_id) {
          userSectionRatings[r.section_id.toString()] = r.rating;
        }
      });
    }

    res.json({
      averageRating: parseFloat(avg),
      totalRatings: count,
      userSectionRatings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
