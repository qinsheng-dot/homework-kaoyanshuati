const { getDb, saveDb } = require('../database');

class Question {
  static findAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (filters.subject) {
      query += ' AND subject = ?';
      params.push(filters.subject);
    }
    if (filters.chapter) {
      query += ' AND chapter = ?';
      params.push(filters.chapter);
    }
    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    query += ' ORDER BY id';
    const stmt = db.prepare(query);
    if (params.length > 0) stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  }

  static getRandom(limit = 10, filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (filters.subject) {
      query += ' AND subject = ?';
      params.push(filters.subject);
    }
    if (filters.chapter) {
      query += ' AND chapter = ?';
      params.push(filters.chapter);
    }
    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY RANDOM() LIMIT ?';
    params.push(limit);
    const stmt = db.prepare(query);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static getByChapter(chapter, subject) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM questions WHERE chapter = ? AND subject = ?');
    stmt.bind([chapter, subject]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  static create(question) {
    const db = getDb();
    db.run(`
      INSERT INTO questions (subject, chapter, type, content, options, answer, explanation, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      question.subject,
      question.chapter,
      question.type,
      question.content,
      JSON.stringify(question.options),
      question.answer,
      question.explanation,
      question.difficulty || 1
    ]);
    saveDb();
    return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
  }

  static getSubjects() {
    const db = getDb();
    const result = db.exec('SELECT DISTINCT subject FROM questions');
    if (result.length === 0) return [];
    return result[0].values.map(r => r[0]);
  }

  static getChapters(subject) {
    const db = getDb();
    const stmt = db.prepare('SELECT DISTINCT chapter FROM questions WHERE subject = ?');
    stmt.bind([subject]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject().chapter);
    }
    stmt.free();
    return results;
  }
}

module.exports = Question;
