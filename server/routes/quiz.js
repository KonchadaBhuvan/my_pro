const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'No token provided' });
  
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
};

router.use(verifyToken);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const QuizAttempt = require('../models/QuizAttempt');

router.post('/generate', async (req, res) => {
  try {
    const { topics, numQuestions = 10, difficulty = 'medium' } = req.body;

    if (!topics || topics.length === 0) {
      return res.status(400).json({ ok: false, error: 'Topics are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ ok: false, error: 'Gemini API key not configured' });
    }

    const topicsList = topics.join(', ');
    const prompt = `Generate ${numQuestions} multiple choice quiz questions on the following topics: ${topicsList}. 
Difficulty level: ${difficulty}.

Format the response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of the correct answer"
  }
]

Make sure the JSON is valid and properly formatted. Return ONLY the JSON array, no additional text.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    let quiz;
    try {
      // Extract JSON from response (in case there's any extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      quiz = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message);
      return res.status(500).json({ 
        ok: false, 
        error: 'Failed to parse quiz data from AI response',
        details: responseText.substring(0, 200)
      });
    }

    return res.json({ ok: true, quiz });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to generate quiz',
      details: err.message 
    });
  }
});

// Submit a completed quiz and store attempt
router.post('/submit', async (req, res) => {
  try {
    const { topics, quiz, userAnswers, score } = req.body;
    if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
      return res.status(400).json({ ok: false, error: 'Quiz data is required' });
    }

    const attempt = new QuizAttempt({
      user: req.userId,
      topics: Array.isArray(topics) ? topics : [],
      quiz,
      userAnswers: userAnswers || {},
      score: typeof score === 'number' ? score : 0,
      numQuestions: quiz.length
    });

    await attempt.save();
    return res.json({ ok: true, attemptId: attempt._id });
  } catch (err) {
    console.error('Submit attempt error:', err);
    res.status(500).json({ ok: false, error: 'Failed to save attempt' });
  }
});

// List attempts for the current user
router.get('/attempts', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId }).select('score numQuestions topics createdAt').sort({ createdAt: -1 });
    return res.json({ ok: true, attempts });
  } catch (err) {
    console.error('List attempts error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch attempts' });
  }
});

// Get a specific attempt (with solutions)
router.get('/attempts/:id', async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ ok: false, error: 'Attempt not found' });
    if (String(attempt.user) !== String(req.userId)) return res.status(403).json({ ok: false, error: 'Not authorized' });
    return res.json({ ok: true, attempt });
  } catch (err) {
    console.error('Get attempt error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch attempt' });
  }
});

module.exports = router;
