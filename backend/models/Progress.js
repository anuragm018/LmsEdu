import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  complete: {
    type: Boolean,
    default: false
  },
  complete_at: {
    type: Date
  }
}, {
  timestamps: true
});

progressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
