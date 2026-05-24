const express = require('express');
const router = express.Router();
const Question = require('../models/question');

function parseOptions(q) {
  if (q.options) {
    try {
      let options = q.options;
      if (typeof options === 'string') {
        options = JSON.parse(options);
        if (typeof options === 'string') {
          options = JSON.parse(options);
        }
      }
      q.options = options;
    } catch (e) {
      q.options = null;
    }
  }
  return q;
}

router.get('/', (req, res) => {
  try {
    const { subject, chapter, type, difficulty } = req.query;
    const filters = {};
    if (subject) filters.subject = subject;
    if (chapter) filters.chapter = chapter;
    if (type) filters.type = type;
    if (difficulty) filters.difficulty = parseInt(difficulty);

    const questions = Question.findAll(filters).map(parseOptions);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subjects', (req, res) => {
  try {
    const subjects = Question.getSubjects();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chapters', (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ error: '需要提供subject参数' });
    }
    const chapters = Question.getChapters(subject);
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/detailed', (req, res) => {
  try {
    const { getDb } = require('../database');
    const db = getDb();
    
    // 获取所有科目的题目数量
    const subjectStmt = db.prepare(`
      SELECT subject, COUNT(*) as count 
      FROM questions 
      GROUP BY subject 
      ORDER BY count DESC
    `);
    
    const subjectStats = [];
    while (subjectStmt.step()) {
      subjectStats.push(subjectStmt.getAsObject());
    }
    subjectStmt.free();
    
    // 获取总题目数
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM questions');
    totalStmt.step();
    const total = totalStmt.getAsObject().count;
    totalStmt.free();
    
    res.json({
      total: total,
      bySubject: subjectStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', (req, res) => {
  try {
    const { keyword, subject } = req.query;
    if (!keyword) {
      return res.status(400).json({ error: '需要提供keyword参数' });
    }
    
    const filters = [];
    const params = [`%${keyword}%`];
    
    if (subject) {
      filters.push('subject = ?');
      params.push(subject);
    }
    
    let sql = `SELECT * FROM questions WHERE content LIKE ?`;
    if (filters.length > 0) {
      sql += ` AND ${filters.join(' AND ')}`;
    }
    
    const { getDb } = require('../database');
    const db = getDb();
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(parseOptions(stmt.getAsObject()));
    }
    stmt.free();
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/random', (req, res) => {
  try {
    const { limit = 10, subject, chapter, type } = req.query;
    const filters = {};
    if (subject) filters.subject = subject;
    if (chapter) filters.chapter = chapter;
    if (type) filters.type = type;

    const questions = Question.getRandom(parseInt(limit), filters).map(parseOptions);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/chapter/:chapter', (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ error: '需要提供subject参数' });
    }
    const questions = Question.getByChapter(req.params.chapter, subject).map(parseOptions);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const question = Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: '题目不存在' });
    }
    parseOptions(question);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
