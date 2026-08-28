import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    default: 15 // in minutes
  },
  total_marks: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);
