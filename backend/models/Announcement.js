import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['normal', 'important', 'update'],
    default: 'normal'
  }
}, {
  timestamps: true
});

export default mongoose.model('Announcement', announcementSchema);
