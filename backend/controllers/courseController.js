import Course from '../models/Course.js';
import Category from '../models/Category.js';

// @desc    Get all courses with optional filters (search, category, type)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { search, category, type, level } = req.query;
    let query = { published: true };

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { desc: { $regex: escaped, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }
    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query)
      .populate('tutor', 'name email avatar bio')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course details
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutor', 'name email avatar bio')
      .populate('category', 'name description icon');

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course (Instructor / Admin)
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    const { name, desc, price, type, category, thumbnail, duration, level } = req.body;

    const course = await Course.create({
      name,
      desc,
      price: type === 'free' ? 0 : price,
      type: type || (price > 0 ? 'paid' : 'free'),
      tutor: req.user._id,
      category,
      thumbnail: thumbnail || undefined,
      duration: duration || '4h 30m',
      level: level || 'All Levels'
    });

    const populated = await Course.findById(course._id)
      .populate('tutor', 'name email avatar')
      .populate('category', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor owner / Admin)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course.name = req.body.name || course.name;
    course.desc = req.body.desc || course.desc;
    course.type = req.body.type || course.type;
    course.price = course.type === 'free' ? 0 : (req.body.price !== undefined ? req.body.price : course.price);
    course.category = req.body.category || course.category;
    course.thumbnail = req.body.thumbnail || course.thumbnail;
    course.duration = req.body.duration || course.duration;
    course.level = req.body.level || course.level;
    if (req.body.published !== undefined) {
      course.published = req.body.published;
    }

    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor owner / Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses created by logged-in instructor
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor/Admin)
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get categories
// @route   GET /api/courses/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/courses/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await Category.create({ name, description, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
