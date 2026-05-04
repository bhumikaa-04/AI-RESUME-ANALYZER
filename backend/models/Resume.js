const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  originalName: String,
  fileName: String,
  mimeType: String,
  size: Number,
  text: String,
  skills: [String],
  missingSkills: [String],
  atsScore: Number,
  wordCount: Number,
  experience: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Resume', resumeSchema)