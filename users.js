const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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

router.post('/register', (req, res) => {
  try {
    console.log('🔄 收到注册请求');
    console.log('   请求体:', req.body);
    
    const { username, password } = req.body;
    
    console.log('   username:', username, '类型:', typeof username);
    console.log('   password:', password ? '******' : '空', '类型:', typeof password);

    if (!username) {
      console.log('❌ 用户名为空');
      return res.status(400).json({ error: '请填写用户名' });
    }

    if (!password) {
      console.log('❌ 密码为空');
      return res.status(400).json({ error: '请填写密码' });
    }

    if (password.length < 6) {
      console.log('❌ 密码长度不足:', password.length);
      return res.status(400).json({ error: '密码长度至少6位' });
    }

    console.log('✅ 验证通过，准备创建用户');
    const email = username + '@example.com';
    const userId = User.create(username, email, password);
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ 注册成功，用户ID:', userId);
    res.json({
      message: '注册成功',
      token,
      user: { id: userId, username }
    });
  } catch (err) {
    console.error('❌ 注册失败:', err.message);
    if (err.message.includes('已存在')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请填写用户名和密码' });
    }

    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (!User.verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/progress', authenticateToken, (req, res) => {
  try {
    const stats = User.getProgressStats(req.user.id);
    const subjectStats = Progress.getSubjectStats(req.user.id);
    res.json({ ...stats, subjectStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/favorites', authenticateToken, (req, res) => {
  try {
    const favorites = User.getFavoriteQuestions(req.user.id);
    favorites.forEach(q => {
      if (q.options) q.options = JSON.parse(q.options);
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/favorites/:questionId', authenticateToken, (req, res) => {
  try {
    User.addFavorite(req.user.id, parseInt(req.params.questionId));
    res.json({ message: '已添加到收藏' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/favorites/:questionId', authenticateToken, (req, res) => {
  try {
    User.removeFavorite(req.user.id, parseInt(req.params.questionId));
    res.json({ message: '已取消收藏' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
