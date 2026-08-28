import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// @desc    Get full syllabus (sections & lessons) for a course
// @route   GET /api/syllabus/:courseId
// @access  Public
export const getCourseSyllabus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const sections = await Section.find({ course_id: courseId }).sort({ order: 1 });
    const lessons = await Lesson.find({ course_id: courseId }).sort({ lesson_order: 1 });

    const syllabus = sections.map(sec => {
      return {
        _id: sec._id,
        name: sec.name,
        order: sec.order,
        lessons: lessons.filter(les => les.section_id.toString() === sec._id.toString())
      };
    });

    res.json(syllabus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a section
// @route   POST /api/syllabus/section
// @access  Private (Instructor/Admin)
export const createSection = async (req, res) => {
  try {
    const { name, order, course_id } = req.body;
    const section = await Section.create({
      name,
      order: order || 1,
      course_id
    });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lesson inside a section
// @route   POST /api/syllabus/lesson
// @access  Private (Instructor/Admin)
export const createLesson = async (req, res) => {
  try {
    const { course_id, section_id, title, lesson_order, video_url, document_url, content, duration } = req.body;

    const lesson = await Lesson.create({
      course_id,
      section_id,
      title,
      lesson_order: lesson_order || 1,
      video_url: video_url || 'https://www.w3schools.com/html/mov_bbb.mp4',
      document_url: document_url || '',
      content: content || '',
      duration: duration || '15 mins'
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/syllabus/lesson/:id
// @access  Private (Instructor/Admin)
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    await lesson.deleteOne();
    res.json({ message: 'Lesson removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
