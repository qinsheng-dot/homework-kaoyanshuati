const { getDb, saveDb } = require('../database');
const bcrypt = require('bcryptjs');

class User {
  static create(username, email, password) {
    const db = getDb();
    const password_hash = bcrypt.hashSync(password, 10);

    try {
      db.run(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `, [username, email, password_hash]);
      saveDb();
      return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        throw new Error('用户名或邮箱已存在');
      }
      throw err;
    }
  }

  static findByUsername(username) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    stmt.bind([username]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  static getProgressStats(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_attempted,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as wrong_count
      FROM progress WHERE user_id = ?
    `);
    stmt.bind([userId]);
    let result = { total_attempted: 0, correct_count: 0, wrong_count: 0 };
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static getFavoriteQuestions(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT q.* FROM questions q
      INNER JOIN favorites f ON q.id = f.question_id
      WHERE f.user_id = ?
    `);
    stmt.bind([userId]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static addFavorite(userId, questionId) {
    const db = getDb();
    db.run(`
      INSERT OR IGNORE INTO favorites (user_id, question_id) VALUES (?, ?)
    `, [userId, questionId]);
    saveDb();
  }

  static removeFavorite(userId, questionId) {
    const db = getDb();
    db.run(`
      DELETE FROM favorites WHERE user_id = ? AND question_id = ?
    `, [userId, questionId]);
    saveDb();
  }

  static isFavorited(userId, questionId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT 1 FROM favorites WHERE user_id = ? AND question_id = ?
    `);
    stmt.bind([userId, questionId]);
    let result = false;
    if (stmt.step()) {
      result = true;
    }
    stmt.free();
    return result;
  }
}

module.exports = User;
