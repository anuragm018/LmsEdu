import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  option_text: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  mark: {
    type: Number,
    default: 10
  },
  question_type: {
    type: String,
    enum: ['MCQ', 'SIMPLE'],
    default: 'MCQ'
  },
  options: [optionSchema]
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);
