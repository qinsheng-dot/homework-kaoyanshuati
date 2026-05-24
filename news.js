const express = require('express');
const router = express.Router();
const { getNews, getNewsByCategory, updateNews, inspirationalQuotes, studyTips } = require('../data/news');

router.get('/news', (req, res) => {
  const { category } = req.query;
  let filteredNews = getNews();
  
  if (category) {
    filteredNews = getNewsByCategory(category);
  }
  
  res.json({
    success: true,
    data: filteredNews
  });
});

router.post('/news/refresh', (req, res) => {
  const updatedNews = updateNews();
  res.json({
    success: true,
    data: updatedNews,
    message: '新闻已更新'
  });
});

router.get('/news/:id', (req, res) => {
  const { id } = req.params;
  const news = getNews().find(n => n.id === parseInt(id));
  
  if (news) {
    res.json({
      success: true,
      data: news
    });
  } else {
    res.json({
      success: false,
      message: '新闻不存在'
    });
  }
});

router.get('/news/categories', (req, res) => {
  const news = getNews();
  const categories = [...new Set(news.map(n => n.category))];
  res.json({
    success: true,
    data: categories
  });
});

router.get('/quote', (req, res) => {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
  res.json({
    success: true,
    data: {
      quote: inspirationalQuotes[randomIndex],
      date: new Date().toISOString().split('T')[0]
    }
  });
});

router.get('/study-tips', (req, res) => {
  res.json({
    success: true,
    data: studyTips
  });
});

router.get('/countdown', (req, res) => {
  const examDate = new Date('2026-12-19T08:30:00');
  const now = new Date();
  const diff = examDate - now;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  res.json({
    success: true,
    data: {
      days,
      hours,
      minutes,
      seconds,
      examDate: examDate.toISOString()
    }
  });
});

module.exports = router;