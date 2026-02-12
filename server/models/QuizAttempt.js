const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topics: [{ type: String }],
    quiz: { type: Array, default: [] },
    userAnswers: { type: Object, default: {} },
    score: { type: Number, default: 0 },
    numQuestions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
