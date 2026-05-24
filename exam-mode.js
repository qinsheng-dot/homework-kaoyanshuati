class ExamMode {
  constructor(options = {}) {
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = {};
    this.timeLimit = 30 * 60; // 默认30分钟
    this.timeRemaining = 0;
    this.timerInterval = null;
    this.onComplete = options.onComplete || (() => {});
    this.isSubmitted = false;
  }

  loadQuestions(questions, timeMinutes = 30) {
    this.questions = questions;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.timeLimit = timeMinutes * 60;
    this.timeRemaining = this.timeLimit;
    this.isSubmitted = false;
    
    this.render();
    this.startTimer();
    this.renderAnswerSheet();
    this.updateProgress();
  }

  render() {
    if (this.questions.length === 0) return;

    const question = this.questions[this.currentIndex];
    const container = document.getElementById('examQuestionCard');
    if (!container) return;

    const options = {
      showAnswer: this.isSubmitted,
      userAnswer: this.userAnswers[this.currentIndex],
      encouragement: ''
    };

    container.innerHTML = renderQuestionCard(question, options);

    const prevBtn = document.getElementById('examPrevBtn');
    const nextBtn = document.getElementById('examNextBtn');

    if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
    if (nextBtn) {
      if (this.currentIndex === this.questions.length - 1) {
        nextBtn.textContent = '提交试卷';
      } else {
        nextBtn.textContent = '下一题';
      }
    }
  }

  renderAnswerSheet() {
    const grid = document.getElementById('answerSheetGrid');
    if (!grid) return;

    grid.innerHTML = this.questions.map((_, index) => {
      const isAnswered = this.userAnswers[index] !== undefined && this.userAnswers[index] !== '';
      const isCurrent = index === this.currentIndex;
      
      return `
        <div class="answer-item ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}" 
             data-index="${index}">
          ${index + 1}
        </div>
      `;
    }).join('');

    // 添加点击事件
    grid.querySelectorAll('.answer-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.goToQuestion(index);
      });
    });
  }

  goToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.currentIndex = index;
      this.render();
      this.renderAnswerSheet();
      this.updateProgress();
    }
  }

  updateProgress() {
    const progressDisplay = document.getElementById('examProgressDisplay');
    if (progressDisplay) {
      const answeredCount = Object.keys(this.userAnswers).filter(
        key => this.userAnswers[key] !== undefined && this.userAnswers[key] !== ''
      ).length;
      progressDisplay.textContent = `${answeredCount}/${this.questions.length}`;
    }
  }

  saveAnswer(userAnswer) {
    const question = this.questions[this.currentIndex];
    
    if (question.type !== 'fill' && question.type !== 'short' && !userAnswer) {
      return;
    }

    if ((question.type === 'fill' || question.type === 'short') && 
        (!userAnswer || userAnswer.trim() === '')) {
      return;
    }

    this.userAnswers[this.currentIndex] = userAnswer;
    this.renderAnswerSheet();
    this.updateProgress();
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.submitExam();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerDisplay = document.getElementById('examTimerDisplay');
    if (!timerDisplay) return;

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // 当时间少于5分钟时添加警告样式
    const timerElement = document.querySelector('.exam-timer');
    if (timerElement) {
      if (this.timeRemaining <= 300) {
        timerElement.classList.add('warning');
      } else {
        timerElement.classList.remove('warning');
      }
    }
  }

  async submitExam() {
    if (this.isSubmitted) return;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isSubmitted = true;

    // 计算结果
    let correctCount = 0;
    let wrongCount = 0;
    const results = [];

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      const userAnswer = this.userAnswers[i];
      let isCorrect = false;

      if (question.type === 'multiple') {
        isCorrect = (userAnswer || []).join('') === question.answer;
      } else if (question.type === 'fill' || question.type === 'short') {
        isCorrect = (userAnswer || '').trim().toLowerCase() === question.answer.trim().toLowerCase();
      } else {
        isCorrect = userAnswer === question.answer;
      }

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      results.push({ questionId: question.id, isCorrect, userAnswer });

      // 记录到服务器
      if (api.isLoggedIn()) {
        try {
          await api.recordProgress(question.id, isCorrect, userAnswer);
        } catch (err) {
          console.error('记录答题结果失败:', err);
        }
      }
    }

    // 显示结果
    this.showResults(correctCount, wrongCount, results);

    // 更新首页统计
    this.updateHomepageStats();
  }

  showResults(correctCount, wrongCount, results) {
    const accuracy = Math.round((correctCount / this.questions.length) * 100);
    
    document.getElementById('resultCorrect').textContent = correctCount;
    document.getElementById('resultWrong').textContent = wrongCount;
    document.getElementById('resultAccuracy').textContent = accuracy + '%';

    let message = '';
    if (accuracy === 100) {
      message = '🏆 太厉害了！满分通过！继续保持！';
    } else if (accuracy >= 80) {
      message = '🎉 优秀！正确率很高，再接再厉！';
    } else if (accuracy >= 60) {
      message = '👍 不错的成绩，继续加油！';
    } else if (accuracy >= 40) {
      message = '💪 还需要多练习，相信你会越来越好！';
    } else {
      message = '📚 加油！多刷题，量变会引起质变的！';
    }
    
    document.getElementById('resultMessage').textContent = message;

    // 跳转到结果页面
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-exam-result').classList.remove('hidden');
  }

  updateHomepageStats() {
    if (!api.isLoggedIn()) return;
    
    api.getStats().then(stats => {
      // 更新首页统计
      document.getElementById('totalQuestions').textContent = '-';
      document.getElementById('totalSubjects').textContent = '-';
      document.getElementById('userAccuracy').textContent = stats.accuracy ? stats.accuracy + '%' : '0%';
      document.getElementById('todayPractice').textContent = stats.todayAnswered || 0;
    }).catch(err => {
      console.error('更新统计失败:', err);
    });
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}

// 全局考试实例
let examMode = null;
