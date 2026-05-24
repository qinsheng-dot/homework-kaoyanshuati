const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const questionsRouter = require('./routes/questions');
const usersRouter = require('./routes/users');
const progressRouter = require('./routes/progress');
const newsRouter = require('./routes/news');
const favoritesRouter = require('./routes/favorites');

app.use('/api/questions', questionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/progress', progressRouter);
app.use('/api', newsRouter);
app.use('/api/favorites', favoritesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '考研刷题网站API运行中' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
});

async function startServer() {
  try {
    await initDb();
    console.log('数据库初始化成功');

    app.listen(PORT, () => {
      console.log(`考研刷题网站服务器已启动: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  }
}

startServer();
