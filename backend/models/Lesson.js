import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  lesson_order: {
    type: Number,
    default: 1
  },
  video_url: {
    type: String,
    default: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  document_url: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: '15 mins'
  }
}, {
  timestamps: true
});

export default mongoose.model('Lesson', lessonSchema);
