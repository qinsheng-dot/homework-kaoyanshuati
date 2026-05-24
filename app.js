function formatAnswer(answer) {
  if (answer === null || answer === undefined || answer === '') {
    return '未作答';
  }
  
  // 如果是对象（如 {"0":0, "1":1} 这种多选题格式）
  if (typeof answer === 'object') {
    // 尝试解析JSON字符串
    if (typeof answer === 'string') {
      try {
        answer = JSON.parse(answer);
      } catch (e) {
        return answer;
      }
    }
    
    // 如果是数组，转为字母选项（如 ['A', 'B'] -> 'AB'）
    if (Array.isArray(answer)) {
      return answer.join('');
    }
    
    // 如果是对象，提取键值转为字母（如 {"0":"A", "1":"B"} -> 'AB'）
    if (typeof answer === 'object') {
      const letters = Object.values(answer);
      // 如果值是数字或字母，直接返回
      return letters.join('');
    }
  }
  
  return String(answer);
}

let currentUser = null;
let practiceMode = null;
let examQuestions = [];
let examAnswers = {};

document.addEventListener('DOMContentLoaded', async function() {
  console.log('页面加载完成，开始初始化...');
  
  try {
    // 步骤1: 先执行同步的初始化
    setupNavigation();
    console.log('导航设置完成');
    
    setupAuth();
    console.log('认证设置完成');
    
    setupPractice();
    console.log('练习设置完成');
    
    setupExam();
    console.log('考试设置完成');
    
    // 步骤2: 自动登录
    await autoLogin();
    
    // 步骤3: 加载数据
    await loadHomeData();
    
    // 步骤4: 更新UI（此时应该已经登录成功）
    if (api.isLoggedIn()) {
      currentUser = { username: localStorage.getItem('username') };
      document.getElementById('loginBtn').classList.add('hidden');
      document.getElementById('logoutBtn').classList.remove('hidden');
      document.getElementById('userInfo').classList.remove('hidden');
      document.getElementById('userName').textContent = currentUser.username || '用户';
      console.log('✅ 用户UI更新完成');
    }
    
    console.log('✅ 初始化完成！');
  } catch(e) {
    console.error('初始化失败:', e);
  }
});

async function autoLogin() {
  // 如果已经登录，直接返回
  if (api.isLoggedIn()) {
    console.log('✅ 用户已登录，跳过自动登录');
    currentUser = { username: localStorage.getItem('username') };
    return;
  }
  
  console.log('🔄 正在自动登录...');
  console.log('   用户名: cxy');
  console.log('   密码: cxy20050915');
  
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'cxy',
        password: 'cxy20050915'
      })
    });
    
    console.log('📡 服务器响应状态:', response.status);
    console.log('📡 服务器响应头:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ 登录失败，状态码:', response.status);
      console.error('❌ 错误信息:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log('📊 登录响应数据:', data);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', 'cxy');
      currentUser = data.user || { username: 'cxy', id: data.id };
      console.log('✅ 自动登录成功！');
      console.log('   Token已保存到localStorage');
      console.log('   用户信息:', currentUser);
    } else {
      console.error('❌ 登录响应中没有token:', data);
      throw new Error('登录响应中没有token');
    }
  } catch (error) {
    console.error('❌ 自动登录失败:', error);
    console.error('❌ 错误详情:', error.message);
    // 如果自动登录失败，继续初始化，不影响其他功能
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('导航点击:', link.dataset.page);
      const page = link.dataset.page;
      navigateTo(page);
    });
  });

  document.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      if (!api.isLoggedIn()) {
        alert('请先登录才能进行刷题');
        document.getElementById('loginBtn').click();
        return;
      }

      const subject = card.dataset.subject;
      document.getElementById('subjectSelect').value = subject;
      navigateTo('practice');
      loadChapters(subject).then(() => {
        document.getElementById('practiceEmpty').classList.remove('hidden');
        document.getElementById('practiceContent').classList.add('hidden');
      });
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.remove('hidden');
  document.querySelector(`.nav-links a[data-page="${page}"]`)?.classList.add('active');
  
  if (page === 'wrong' || page === 'stats') {
    loadUserData(page);
  }
  
  // 关键：导航到首页时更新统计数据
  if (page === 'home') {
    loadHomeData();
  }
  
  // 关键：导航到dashboard时初始化
  if (page === 'dashboard') {
    if (typeof dashboard !== 'undefined') {
      dashboard.init();
    }
  }
}

async function setupAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const modal = document.getElementById('modal');
  const submitLogin = document.getElementById('submitLogin');
  const submitRegister = document.getElementById('submitRegister');
  const cancelLogin = document.getElementById('cancelLogin');
  const cancelRegister = document.getElementById('cancelRegister');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  loginBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
  });

  logoutBtn.addEventListener('click', async () => {
    api.logout();
    currentUser = null;
    updateUserUI();
    navigateTo('home');
  });

  cancelLogin.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  cancelRegister.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  showRegister.addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
  });

  showLogin.addEventListener('click', () => {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  });

  submitLogin.addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      alert('请填写用户名和密码');
      return;
    }

    try {
      await api.login(username, password);
      await updateUserUI();
      modal.classList.add('hidden');
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  submitRegister.addEventListener('click', async () => {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
      alert('请填写所有信息');
      return;
    }

    if (password.length < 6) {
      alert('密码长度至少6位');
      return;
    }

    try {
      await api.register(username, email, password);
      await updateUserUI();
      modal.classList.add('hidden');
      document.getElementById('registerUsername').value = '';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPassword').value = '';
    } catch (err) {
      alert(err.message);
    }
  });
}

async function updateUserUI() {
  try {
    currentUser = await api.getProfile();
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.username;
    
    // 登录成功后加载统计数据
    await loadHomeData();
  } catch (err) {
    console.error('获取用户信息失败:', err);
    api.logout();
  }
}

async function loadHomeData() {
  try {
    console.log('开始加载首页数据...');
    
    // 使用详细统计API获取题目数量
    try {
      const statsResponse = await fetch('/api/questions/stats/detailed');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        
        // 更新总题目数
        document.getElementById('totalQuestions').textContent = stats.total || 0;
        
        console.log('✅ 题库统计已更新:', stats);
      }
    } catch (statsErr) {
      console.error('❌ 获取题库统计失败:', statsErr);
      // 如果详细统计失败，尝试使用原有方法
      const questions = await api.getQuestions();
      document.getElementById('totalQuestions').textContent = questions.length || 0;
    }
    
    const subjects = await api.getSubjects();
    console.log('科目数据:', subjects);
    document.getElementById('totalSubjects').textContent = subjects.length || '-';

    // 如果用户已登录，加载用户统计数据
    if (api.isLoggedIn()) {
      try {
        const stats = await api.getStats();
        console.log('用户统计:', stats);
        document.getElementById('userAccuracy').textContent = stats.accuracy ? stats.accuracy + '%' : '0%';
        document.getElementById('todayPractice').textContent = stats.todayAnswered || 0;
      } catch (statsErr) {
        console.error('获取用户统计失败:', statsErr);
      }
    }
    
    console.log('✅ 首页数据加载完成');
  } catch (err) {
    console.error('❌ 加载首页数据失败:', err);
    // 即使加载失败，也要显示默认值
    document.getElementById('totalSubjects').textContent = '-';
    document.getElementById('totalQuestions').textContent = '-';
    document.getElementById('userAccuracy').textContent = '-';
    document.getElementById('todayPractice').textContent = '-';
  }
}

async function loadChapters(subject) {
  const chapterSelect = document.getElementById('chapterSelect');
  if (!chapterSelect) return;
  try {
    const chapters = await api.getChapters(subject);
    chapterSelect.innerHTML = '<option value="">选择章节</option>';
    chapters.forEach(chapter => {
      const option = document.createElement('option');
      option.value = chapter;
      option.textContent = chapter;
      chapterSelect.appendChild(option);
    });
    chapterSelect.disabled = false;
  } catch (err) {
    console.error('加载章节失败:', err);
  }
}

function setupPractice() {
  const subjectSelect = document.getElementById('subjectSelect');
  const startPracticeBtn = document.getElementById('startPractice');

  // 先清空现有选项，防止重复添加
  subjectSelect.innerHTML = '<option value="">选择科目</option>';

  api.getSubjects().then(subjects => {
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
  });

  subjectSelect.addEventListener('change', async (e) => {
    await loadChapters(e.target.value);
  });

  startPracticeBtn.addEventListener('click', async () => {
    if (!api.isLoggedIn()) {
      alert('请先登录才能进行刷题');
      document.getElementById('loginBtn').click();
      return;
    }

    const subject = document.getElementById('subjectSelect').value;
    const chapter = document.getElementById('chapterSelect').value;
    const type = document.getElementById('typeSelect').value;

    if (!subject) {
      alert('请选择科目');
      return;
    }

    try {
      const filters = { subject };
      if (chapter) filters.chapter = chapter;
      if (type) filters.type = type;

      const questions = await api.getQuestions(filters);

      if (questions.length === 0) {
        alert('没有找到符合条件的题目');
        return;
      }

      practiceMode = new PracticeMode({
        onComplete: () => {
          document.getElementById('practiceEmpty').classList.remove('hidden');
          document.getElementById('practiceContent').classList.add('hidden');
          // 更新统计数据
          loadHomeData();
        }
      });

      practiceMode.loadQuestions(questions);

      document.getElementById('practiceEmpty').classList.add('hidden');
      document.getElementById('practiceContent').classList.remove('hidden');
    } catch (err) {
      console.error('加载题目失败:', err);
      alert('加载题目失败: ' + err.message);
    }
  });
}

function setupExam() {
  const examSubject = document.getElementById('examSubject');
  const startExamBtn = document.getElementById('startExam');

  api.getSubjects().then(subjects => {
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      examSubject.appendChild(option);
    });
  });

  startExamBtn.addEventListener('click', async () => {
    if (!api.isLoggedIn()) {
      alert('请先登录才能进行模拟考试');
      document.getElementById('loginBtn').click();
      return;
    }

    const subject = examSubject.value;
    const count = parseInt(document.getElementById('examCount').value);
    const timeMinutes = parseInt(document.getElementById('examTime').value);

    if (!subject) {
      alert('请选择科目');
      return;
    }

    try {
      const questions = await api.getRandomQuestions(count, { subject });

      if (questions.length === 0) {
        alert('没有找到符合条件的题目');
        return;
      }

      // 创建考试实例
      examMode = new ExamMode({
        onComplete: () => {
          // 考试完成回调
        }
      });

      // 显示考试界面
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      document.getElementById('page-exam-active').classList.remove('hidden');

      // 更新考试信息
      document.getElementById('examSubjectDisplay').textContent = subject;

      // 加载题目
      examMode.loadQuestions(questions, timeMinutes);

    } catch (err) {
      console.error('加载考试题目失败:', err);
      alert('加载考试题目失败: ' + err.message);
    }
  });

  // 交卷按钮
  document.getElementById('submitExamBtn').addEventListener('click', async () => {
    if (confirm('确定要交卷吗？')) {
      if (examMode) {
        await examMode.submitExam();
        // 更新统计数据
        loadHomeData();
      }
    }
  });

  // 上一题按钮
  document.getElementById('examPrevBtn').addEventListener('click', () => {
    if (examMode) {
      examMode.goToQuestion(examMode.currentIndex - 1);
    }
  });

  // 下一题按钮
  document.getElementById('examNextBtn').addEventListener('click', () => {
    if (examMode) {
      if (examMode.currentIndex === examMode.questions.length - 1) {
        // 已经是最后一题，保存当前答案并提示交卷
        examMode.saveAnswer(getSelectedAnswer(document.querySelector('.question-type')?.textContent || '单选题'));
        if (confirm('已经是最后一题了，要交卷吗？')) {
          examMode.submitExam();
        }
      } else {
        examMode.saveAnswer(getSelectedAnswer(document.querySelector('.question-type')?.textContent || '单选题'));
        examMode.goToQuestion(examMode.currentIndex + 1);
      }
    }
  });

  // 返回首页按钮
  document.getElementById('backToHomeBtn').addEventListener('click', () => {
    navigateTo('home');
  });

  // 查看错题按钮
  document.getElementById('reviewExamBtn').addEventListener('click', () => {
    navigateTo('wrong');
  });
}

async function loadUserData(page) {
  if (!api.isLoggedIn()) {
    document.getElementById('loginBtn').click();
    return;
  }

  try {
    const stats = await api.getStats();

    if (page === 'stats') {
      document.getElementById('statTotal').textContent = stats.totalAnswered || 0;
      document.getElementById('statAccuracy').textContent = stats.accuracy ? stats.accuracy + '%' : '0%';
      document.getElementById('statToday').textContent = stats.todayAnswered || 0;
      document.getElementById('statWrong').textContent = stats.wrongCount || 0;
    } else if (page === 'wrong') {
      const wrongQuestions = await api.getWrongQuestions();
      const wrongList = document.getElementById('wrongList');

      if (wrongQuestions.length === 0) {
        wrongList.innerHTML = `
          <div class="empty-state">
            <span>📚</span>
            <h3>暂无错题</h3>
            <p>继续刷题，错题会自动收集到这里</p>
          </div>
        `;
      } else {
        wrongList.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>共 ${wrongQuestions.length} 道错题</h3>
            <button class="btn btn-primary" id="redoAllBtn">重新练习全部错题</button>
          </div>
          <div class="wrong-questions-list">
            ${wrongQuestions.map((q, index) => {
              const options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {});
              const optionsHtml = Object.entries(options).map(([key, value]) => 
                `<div class="option-item" data-option="${key}">
                  <span class="option-label">${key}.</span>
                  <span class="option-text">${value}</span>
                </div>`
              ).join('');
              
              let answerHtml = '';
              if (q.type === 'fill' || q.type === 'short') {
                answerHtml = `<div class="form-group">
                  <input type="text" class="fill-input" placeholder="请输入答案" data-question-id="${q.id}">
                </div>`;
              }
              
              return `
                <div class="question-card wrong-question" data-question-id="${q.id}">
                  <div class="question-header">
                    <span class="question-type">${q.type === 'single' ? '单选题' : q.type === 'multiple' ? '多选题' : q.type === 'fill' ? '填空题' : '简答题'}</span>
                    <span class="question-index">第 ${index + 1} 题</span>
                  </div>
                  <div class="question-content">${q.content}</div>
                  <div class="question-options">${optionsHtml}${answerHtml}</div>
                  <div class="wrong-answer-section">
                    <p><strong>你的答案:</strong> <span class="wrong-answer">${formatAnswer(q.user_answer)}</span></p>
                    <p><strong>正确答案:</strong> <span class="correct-answer">${q.answer}</span></p>
                    ${q.explanation ? `<p><strong>解析:</strong> ${q.explanation}</p>` : ''}
                  </div>
                  <button class="btn btn-secondary redo-btn" data-question-id="${q.id}">重做此题</button>
                </div>
              `;
            }).join('')}
          </div>
        `;
        
        // 添加重做按钮事件
        document.getElementById('redoAllBtn')?.addEventListener('click', () => {
          redoAllWrongQuestions(wrongQuestions);
        });
        
        document.querySelectorAll('.redo-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const questionId = parseInt(e.target.dataset.questionId);
            const question = wrongQuestions.find(q => q.id === questionId);
            if (question) {
              redoSingleQuestion([question]);
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('加载用户数据失败:', err);
  }
}

function redoAllWrongQuestions(questions) {
  // 确保显示练习页面
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-practice').classList.remove('hidden');
  document.getElementById('practiceEmpty').classList.add('hidden');
  document.getElementById('practiceContent').classList.remove('hidden');
  
  practiceMode = new PracticeMode({
    onComplete: () => {
      document.getElementById('page-wrong').classList.remove('hidden');
      document.getElementById('practiceContent').classList.add('hidden');
      loadUserData('wrong');
      // 更新统计数据
      loadHomeData();
    }
  });
  
  const processedQuestions = questions.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {})
  }));
  
  practiceMode.loadQuestions(processedQuestions);
}

function redoSingleQuestion(questions) {
  // 确保显示练习页面
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-practice').classList.remove('hidden');
  document.getElementById('practiceEmpty').classList.add('hidden');
  document.getElementById('practiceContent').classList.remove('hidden');
  
  practiceMode = new PracticeMode({
    onComplete: () => {
      document.getElementById('page-wrong').classList.remove('hidden');
      document.getElementById('practiceContent').classList.add('hidden');
      loadUserData('wrong');
      // 更新统计数据
      loadHomeData();
    }
  });
  
  const processedQuestions = questions.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {})
  }));
  
  practiceMode.loadQuestions(processedQuestions);
}

document.addEventListener('click', async (e) => {
  if (e.target.closest('.option-item') && !e.target.closest('.option-item').classList.contains('disabled')) {
    handleOptionClick(e);
    
    // 如果在考试模式中，自动保存答案
    if (examMode && !examMode.isSubmitted) {
      const userAnswer = getSelectedAnswer(document.querySelector('.question-type')?.textContent || '单选题');
      examMode.saveAnswer(userAnswer);
    }
  }

  if (e.target.id === 'submitAnswer') {
    practiceMode?.submitAnswer();
    // 更新统计数据
    setTimeout(() => loadHomeData(), 100);
  }

  if (e.target.id === 'nextQuestion') {
    practiceMode?.next();
  }

  if (e.target.id === 'prevQuestion') {
    practiceMode?.prev();
  }

  if (e.target.id === 'favoriteBtn') {
    const questionId = practiceMode?.questions[practiceMode.currentIndex]?.id;
    if (questionId) {
      const isFavorited = favoriteBtn.dataset.favorited === 'true';
      try {
        if (isFavorited) {
          await api.removeFavorite(questionId);
          favoriteBtn.textContent = '☆ 收藏';
          favoriteBtn.dataset.favorited = 'false';
        } else {
          await api.addFavorite(questionId);
          favoriteBtn.textContent = '★ 已收藏';
          favoriteBtn.dataset.favorited = 'true';
        }
      } catch (err) {
        alert('操作失败: ' + err.message);
      }
    }
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'fillAnswer' || e.target.id === 'shortAnswer') {
    // 如果在考试模式中，自动保存填空/简答题答案
    if (examMode && !examMode.isSubmitted) {
      examMode.saveAnswer(e.target.value);
    }
  }
});
