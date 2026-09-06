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
      amount: amount !== undefined ? amount : course.price,
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

// @desc    Get tutor earnings, per-course sales & recent student purchases
// @route   GET /api/transactions/tutor/earnings
// @access  Private (Instructor/Admin)
export const getTutorEarnings = async (req, res) => {
  try {
    // 1. Find all courses taught by this tutor
    const myCourses = await Course.find({ tutor: req.user._id });
    const courseIds = myCourses.map(c => c._id);

    // 2. Find all successful purchases for these courses
    const transactions = await Transaction.find({
      course_id: { $in: courseIds },
      payment_status: 'SUCCESS'
    })
      .populate('user_id', 'name email avatar')
      .populate('course_id', 'name price thumbnail type')
      .sort({ createdAt: -1 });

    // 3. Calculate total revenue and total sales count
    const totalEarnings = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalSales = transactions.length;

    // 4. Per-course earnings breakdown
    const courseBreakdown = myCourses.map(course => {
      const courseTx = transactions.filter(t => t.course_id && t.course_id._id.toString() === course._id.toString());
      const earnings = courseTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      return {
        _id: course._id,
        name: course.name,
        price: course.price,
        type: course.type,
        thumbnail: course.thumbnail,
        salesCount: courseTx.length,
        earnings: Number(earnings.toFixed(2))
      };
    });

    res.json({
      success: true,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalSales,
      totalCourses: myCourses.length,
      courseBreakdown,
      recentTransactions: transactions
    });
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

// @desc    Get total revenue summary for navbar button
// @route   GET /api/transactions/total-revenue
// @access  Public / Authenticated
export const getTotalRevenueSummary = async (req, res) => {
  try {
    let totalRevenue = 0;

    // If instructor is logged in, show their specific course earnings
    if (req.user && req.user.role === 'instructor') {
      const myCourses = await Course.find({ tutor: req.user._id });
      const courseIds = myCourses.map(c => c._id);
      const transactions = await Transaction.find({
        course_id: { $in: courseIds },
        payment_status: 'SUCCESS'
      });
      totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      return res.json({
        totalRevenue: Number(totalRevenue.toFixed(2)),
        role: 'instructor',
        label: 'Tutor Revenue'
      });
    }

    // If admin, student, or guest, return platform overall revenue
    const allSuccessfulTx = await Transaction.find({ payment_status: 'SUCCESS' });
    totalRevenue = allSuccessfulTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      role: req.user ? req.user.role : 'guest',
      label: 'Total Revenue'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
