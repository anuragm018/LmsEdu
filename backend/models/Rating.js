import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

ratingSchema.index({ user_id: 1, course_id: 1, section_id: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

// Automatically drop obsolete compound index on (user_id, course_id) if present in database
Rating.collection.dropIndex('user_id_1_course_id_1').catch(() => {});

export default Rating;
