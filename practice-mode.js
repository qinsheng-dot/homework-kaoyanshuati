class PracticeMode {
  constructor(options = {}) {
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.showAnswer = false;
    this.onComplete = options.onComplete || (() => {});
    this.correctCount = 0;
  }

  loadQuestions(questions) {
    this.questions = questions;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.showAnswer = false;
    this.correctCount = 0;
    this.render();
  }

  render() {
    if (this.questions.length === 0) return;

    const question = this.questions[this.currentIndex];
    const container = document.getElementById('questionCard');
    if (!container) return;

    const options = {
      showAnswer: this.showAnswer,
      userAnswer: this.userAnswers[this.currentIndex],
      encouragement: this.encouragementText
    };

    container.innerHTML = renderQuestionCard(question, options);

    const currentNum = document.getElementById('currentNum');
    const totalNum = document.getElementById('totalNum');
    const prevQuestion = document.getElementById('prevQuestion');
    const nextQuestion = document.getElementById('nextQuestion');
    const submitAnswer = document.getElementById('submitAnswer');

    if (currentNum) currentNum.textContent = this.currentIndex + 1;
    if (totalNum) totalNum.textContent = this.questions.length;
    if (prevQuestion) prevQuestion.disabled = this.currentIndex === 0;
    if (nextQuestion) nextQuestion.classList.toggle('hidden', !this.showAnswer);
    if (submitAnswer) submitAnswer.classList.toggle('hidden', this.showAnswer);

    this.updateFavoriteBtn(question.id);
  }

  updateFavoriteBtn(questionId) {
    const btn = document.getElementById('favoriteBtn');
    if (!btn) return;

    if (!api.isLoggedIn()) {
      btn.classList.add('hidden');
      return;
    }

    btn.classList.remove('hidden');
    api.getFavorites().then(favorites => {
      const isFavorited = favorites.some(q => q.id === questionId);
      btn.textContent = isFavorited ? '★ 已收藏' : '☆ 收藏';
      btn.dataset.favorited = isFavorited;
    }).catch(() => {
      btn.textContent = '☆ 收藏';
    });
  }

  async submitAnswer() {
    const question = this.questions[this.currentIndex];
    const questionTypeEl = document.querySelector('.question-type');
    if (!questionTypeEl) return;

    const questionType = questionTypeEl.textContent;
    const userAnswer = getSelectedAnswer(questionType);

    if (question.type !== 'fill' && question.type !== 'short' && !userAnswer) {
      alert('请选择答案');
      return;
    }

    if ((question.type === 'fill' || question.type === 'short') && (!userAnswer || userAnswer.trim() === '')) {
      alert('请输入答案');
      return;
    }

    this.userAnswers[this.currentIndex] = userAnswer;
    
    let isCorrect = false;
    if (question.type === 'multiple') {
      isCorrect = userAnswer.join('') === question.answer;
    } else if (question.type === 'fill' || question.type === 'short') {
      isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    } else {
      isCorrect = userAnswer === question.answer;
    }

    if (isCorrect) {
      this.correctCount++;
      this.encouragementText = this.getCorrectEncouragement();
    } else {
      this.encouragementText = this.getWrongEncouragement();
    }

    this.showAnswer = true;
    this.render();

    if (api.isLoggedIn()) {
      try {
        await api.recordProgress(question.id, isCorrect, userAnswer);
        // 立即更新首页统计
        this.updateHomepageStats();
      } catch (err) {
        console.error('记录答题结果失败:', err);
      }
    }
  }

  getCorrectEncouragement() {
    const encouragements = [
      '🎉 太棒了！回答正确！',
      '✨ 非常好！继续保持！',
      '💯 完美！你真聪明！',
      '🌟 答对了！再接再厉！',
      '🚀 优秀！你做得很棒！',
      '👍 正确！继续加油！',
      '👏 干得漂亮！',
      '💪 实力在线！',
      '🏆 学霸级别！',
      '🔥 太厉害了！'
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  getWrongEncouragement() {
    const encouragements = [
      '💡 别灰心，继续努力！',
      '📚 再想想，你可以的！',
      '🎯 差一点点，加油！',
      '🌈 失败是成功之母！',
      '💪 相信自己，下次一定行！',
      '📖 多练习，你会进步的！',
      '🌟 每一次尝试都是成长！',
      '🚀 坚持下去，胜利就在前方！',
      '🎨 错误是学习的机会！',
      '💎 你的努力终将有回报！'
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.showAnswer = false;
      this.encouragementText = '';
      this.render();
    } else {
      this.showSummary();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showAnswer = !!this.userAnswers[this.currentIndex];
      this.render();
    }
  }

  showSummary() {
    const accuracy = Math.round((this.correctCount / this.questions.length) * 100);
    
    let summaryMessage = '';
    if (accuracy === 100) {
      summaryMessage = `🏆 满分！你太厉害了！正确率: ${accuracy}%\n\n继续保持这个状态，考研必胜！💪`;
    } else if (accuracy >= 80) {
      summaryMessage = `🎉 优秀！正确率: ${accuracy}%\n\n非常棒！再巩固一下错题就更完美了！✨`;
    } else if (accuracy >= 60) {
      summaryMessage = `👍 不错！正确率: ${accuracy}%\n\n继续努力，相信你能做得更好！💪`;
    } else {
      summaryMessage = `💪 加油！正确率: ${accuracy}%\n\n多练习，错题本是你的好帮手！相信你一定可以！🌟`;
    }

    alert(`练习完成!\n\n正确: ${this.correctCount}/${this.questions.length}\n${summaryMessage}`);

    this.updateHomepageStats(this.correctCount, this.questions.length);
    this.onComplete();
  }

  updateHomepageStats(correct, total) {
    if (!api.isLoggedIn()) return;
    
    api.getStats().then(stats => {
      const statCards = document.querySelectorAll('.stat-card');
      statCards.forEach(card => {
        const label = card.querySelector('.stat-label').textContent;
        if (label.includes('总答题数')) {
          card.querySelector('.stat-value').textContent = stats.totalAnswered || 0;
        } else if (label.includes('正确率')) {
          card.querySelector('.stat-value').textContent = stats.accuracy ? stats.accuracy + '%' : '0%';
        } else if (label.includes('今日练习')) {
          card.querySelector('.stat-value').textContent = stats.todayAnswered || 0;
        } else if (label.includes('错题本')) {
          card.querySelector('.stat-value').textContent = stats.wrongCount || 0;
        }
      });
    }).catch(err => {
      console.error('更新统计失败:', err);
    });
  }
}
