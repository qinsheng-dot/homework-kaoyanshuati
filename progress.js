const { getDb, saveDb } = require('../database');

class Progress {
  static record(userId, questionId, isCorrect, userAnswer) {
    const db = getDb();
    db.run(`
      INSERT INTO progress (user_id, question_id, is_correct, user_answer)
      VALUES (?, ?, ?, ?)
    `, [userId, questionId, isCorrect ? 1 : 0, userAnswer]);
    saveDb();
  }

  static getWrongQuestions(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT DISTINCT q.*, p.user_answer, p.attempted_at
      FROM questions q
      INNER JOIN progress p ON q.id = p.question_id
      WHERE p.user_id = ? AND p.is_correct = 0
      ORDER BY p.attempted_at DESC
    `);
    stmt.bind([userId]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getUserHistory(userId, limit = 50) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT q.*, p.is_correct, p.user_answer, p.attempted_at
      FROM questions q
      INNER JOIN progress p ON q.id = p.question_id
      WHERE p.user_id = ?
      ORDER BY p.attempted_at DESC
      LIMIT ?
    `);
    stmt.bind([userId, limit]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getDailyStats(userId, days = 90) {
    const db = getDb();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const stmt = db.prepare(`
      SELECT 
        DATE(attempted_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM progress
      WHERE user_id = ? AND DATE(attempted_at) >= ?
      GROUP BY DATE(attempted_at)
      ORDER BY date ASC
    `);
    stmt.bind([userId, startDateStr]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getSubjectStats(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT q.subject,
        COUNT(*) as total,
        SUM(CASE WHEN p.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM progress p
      INNER JOIN questions q ON p.question_id = q.id
      WHERE p.user_id = ?
      GROUP BY q.subject
    `);
    stmt.bind([userId]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getChapterStats(userId, subject) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT q.chapter,
        COUNT(*) as total,
        SUM(CASE WHEN p.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM progress p
      INNER JOIN questions q ON p.question_id = q.id
      WHERE p.user_id = ? AND q.subject = ?
      GROUP BY q.chapter
    `);
    stmt.bind([userId, subject]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getAccuracyTrend(userId, days = 7) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT DATE(attempted_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM progress
      WHERE user_id = ? AND attempted_at >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(attempted_at)
      ORDER BY date
    `);
    stmt.bind([userId, days]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getUserStats(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as totalAttempted,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctCount
      FROM progress
      WHERE user_id = ?
    `);
    stmt.bind([userId]);

    let result = { totalAttempted: 0, correctCount: 0 };
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static getTodayCount(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM progress
      WHERE user_id = ? AND DATE(attempted_at) = DATE('now')
    `);
    stmt.bind([userId]);

    let count = 0;
    if (stmt.step()) {
      count = stmt.getAsObject().count || 0;
    }
    stmt.free();
    return count;
  }
}

module.exports = Progress;
