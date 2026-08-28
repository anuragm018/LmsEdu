import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizResult from '../models/QuizResult.js';

// @desc    Create quiz for a course
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
export const createQuiz = async (req, res) => {
  try {
    const { course_id, title, duration, total_marks, questions } = req.body;

    const quiz = await Quiz.create({
      course_id,
      title,
      duration: duration || 15,
      total_marks: total_marks || 100
    });

    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        await Question.create({
          quiz_id: quiz._id,
          question: q.question,
          mark: q.mark || 10,
          question_type: q.question_type || 'MCQ',
          options: q.options || []
        });
      }
    }

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Public / Enrolled Student
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course_id: courseId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz with questions
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.find({ quiz_id: quiz._id });
    res.json({
      ...quiz.toObject(),
      questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz attempt & auto-grade
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
export const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body; // array of { question_id, selected_option_index }
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questions = await Question.find({ quiz_id: quizId });
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      maxScore += q.mark;
      const userAns = answers.find(a => a.question_id === q._id.toString());
      if (userAns && userAns.selected_option_index !== undefined) {
        const selectedOpt = q.options[userAns.selected_option_index];
        if (selectedOpt && selectedOpt.is_correct) {
          totalScore += q.mark;
        }
      }
    });

    const passPercentage = 60;
    const scorePct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = scorePct >= passPercentage;

    const result = await QuizResult.create({
      user_id: userId,
      quiz_id: quizId,
      score: totalScore,
      total_possible: maxScore,
      passed
    });

    res.status(201).json({
      resultId: result._id,
      score: totalScore,
      totalPossible: maxScore,
      percentage: Math.round(scorePct),
      passed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
