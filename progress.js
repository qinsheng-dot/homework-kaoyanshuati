const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Progress = require('../models/progress');

const JWT_SECRET = 'shuatiwangzhan-secret-key-2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '需要登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: '无效的token' });
  }
}

router.post('/', authenticateToken, (req, res) => {
  try {
    const { questionId, isCorrect, userAnswer } = req.body;

    if (!questionId || isCorrect === undefined) {
      return res.status(400).json({ error: '请提供题目ID和答题结果' });
    }

    let answerToSave = userAnswer;
    if (Array.isArray(userAnswer)) {
      answerToSave = userAnswer.join('');
    } else if (typeof userAnswer === 'object') {
      answerToSave = JSON.stringify(userAnswer);
    }

    Progress.record(req.user.id, questionId, isCorrect, answerToSave);
    res.json({ message: '答题记录已保存' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/wrong', authenticateToken, (req, res) => {
  try {
    const wrongQuestions = Progress.getWrongQuestions(req.user.id);
    wrongQuestions.forEach(q => {
      if (q.options) q.options = JSON.parse(q.options);
    });
    res.json(wrongQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', authenticateToken, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = Progress.getUserHistory(req.user.id, parseInt(limit));
    history.forEach(q => {
      if (q.options) q.options = JSON.parse(q.options);
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticateToken, (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // 获取基础统计
    const stats = Progress.getUserStats(req.user.id);
    
    // 获取今日答题数
    const todayCount = Progress.getTodayCount(req.user.id);
    
    // 获取错题数
    const wrongQuestions = Progress.getWrongQuestions(req.user.id);
    
    // 计算正确率
    const accuracy = stats.totalAttempted > 0 
      ? Math.round((stats.correctCount / stats.totalAttempted) * 100) 
      : 0;
    
    res.json({
      totalAnswered: stats.totalAttempted,
      correctCount: stats.correctCount,
      wrongCount: wrongQuestions.length,
      accuracy: accuracy,
      todayAnswered: todayCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chapter-stats', authenticateToken, (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ error: '需要提供subject参数' });
    }
    const chapterStats = Progress.getChapterStats(req.user.id, subject);
    res.json(chapterStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/heatmap', authenticateToken, (req, res) => {
  try {
    console.log('📊 获取热力图数据，用户ID:', req.user.id);
    const { days = 90 } = req.query;
    const dailyStats = Progress.getDailyStats(req.user.id, parseInt(days));
    console.log('📊 热力图数据:', dailyStats);
    res.json(dailyStats);
  } catch (err) {
    console.error('❌ 热力图API错误:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
