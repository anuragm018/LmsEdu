import Transaction from '../models/Transaction.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Process course purchase transaction & auto-enroll
// @route   POST /api/transactions
// @access  Private (Student)
export const processPurchase = async (req, res) => {
  try {
    const { course_id, payment_method, amount } = req.body;
    const user_id = req.user._id;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const txRef = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const transaction = await Transaction.create({
      user_id,
      course_id,
      amount: amount || course.price,
      payment_method: payment_method || 'CARD',
      payment_status: 'SUCCESS',
      transaction_reference: txRef
    });

    // Auto enroll on successful purchase
    const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
    if (!existingEnrollment) {
      await Enrollment.create({ user_id, course_id });
    }

    res.status(201).json({
      message: 'Transaction successful and enrolled in course',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's transactions
// @route   GET /api/transactions/my-transactions
// @access  Private (Student)
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user._id })
      .populate('course_id', 'name price thumbnail')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions (Admin)
// @route   GET /api/transactions/admin/all
// @access  Private (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user_id', 'name email')
      .populate('course_id', 'name price')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
