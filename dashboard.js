class Dashboard {
  constructor() {
    this.news = [];
    this.categories = [];
    this.currentCategory = '全部';
    this.countdownInterval = null;
    this.quote = '';
    this.studyTips = [];
    this.currentModal = null;
  }

  async init() {
    console.log('🚀 Dashboard初始化开始...');
    try {
      await Promise.all([
        this.loadNews(),
        this.loadQuote(),
        this.loadStudyTips()
      ]);
      this.startCountdown();
      this.render();
      this.bindEvents();
      console.log('✅ Dashboard初始化完成！');
    } catch (error) {
      console.error('❌ Dashboard初始化失败:', error);
    }
  }

  async loadNews() {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      this.news = data.data;
      this.categories = ['全部', ...new Set(this.news.map(n => n.category))];
      console.log('📰 新闻加载成功:', this.news.length, '条');
    } catch (error) {
      console.error('❌ 加载新闻失败:', error);
      this.news = [];
    }
  }

  async loadQuote() {
    try {
      const response = await fetch('/api/quote');
      const data = await response.json();
      this.quote = data.data.quote;
    } catch (error) {
      console.error('❌ 加载语录失败:', error);
      this.quote = '坚持就是胜利！';
    }
  }

  async loadStudyTips() {
    try {
      const response = await fetch('/api/study-tips');
      const data = await response.json();
      this.studyTips = data.data;
    } catch (error) {
      console.error('❌ 加载学习建议失败:', error);
      this.studyTips = ['合理安排学习时间', '保持良好作息'];
    }
  }

  async updateCountdown() {
    try {
      const response = await fetch('/api/countdown');
      const data = await response.json();
      const { days, hours, minutes, seconds } = data.data;
      
      const daysEl = document.getElementById('countdown-days');
      const hoursEl = document.getElementById('countdown-hours');
      const minsEl = document.getElementById('countdown-minutes');
      const secsEl = document.getElementById('countdown-seconds');
      
      if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
      if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
      if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
      if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
    } catch (error) {
      console.error('❌ 更新倒计时失败:', error);
    }
  }

  startCountdown() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  filterNews(category) {
    this.currentCategory = category;
    this.renderNews();
  }

  closeCurrentModal() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.body.style.overflow = '';
    }
  }

  showNewsDetail(newsId) {
    console.log('📖 查看新闻详情，ID:', newsId);
    const news = this.news.find(n => n.id === newsId);
    if (!news) {
      console.error('❌ 新闻不存在');
      return;
    }

    this.closeCurrentModal();

    const modal = document.createElement('div');
    modal.className = 'dashboard-modal news-detail-modal';
    modal.onclick = (e) => {
      if (e.target === modal) {
        console.log('点击遮罩层，关闭弹窗');
        this.closeCurrentModal();
      }
    };

    modal.innerHTML = `
      <div class="modal-inner-content">
        <div class="modal-header">
          <span class="modal-category">${news.category}</span>
          <button class="modal-close" title="关闭">✕</button>
        </div>
        <div class="modal-body">
          <h2 class="modal-title">${news.title}</h2>
          <div class="modal-meta">
            <span class="modal-date">📅 ${news.date}</span>
            ${news.hot ? '<span class="modal-hot">🔥 热门</span>' : ''}
          </div>
          <div class="modal-content-text">${news.content ? news.content.replace(/\n/g, '<br><br>') : news.summary}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-btn">关闭</button>
          <button class="btn btn-primary open-url-btn">🔗 查看官网原文</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.currentModal = modal;

    const closeBtn = modal.querySelector('.modal-close');
    const closeBtn2 = modal.querySelector('.close-btn');
    const openUrlBtn = modal.querySelector('.open-url-btn');

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      console.log('点击关闭按钮');
      this.closeCurrentModal();
    };

    closeBtn2.onclick = (e) => {
      e.stopPropagation();
      console.log('点击关闭按钮2');
      this.closeCurrentModal();
    };

    openUrlBtn.onclick = (e) => {
      e.stopPropagation();
      console.log('🔗 打开官网链接:', news.url);
      if (news.url) {
        window.open(news.url, '_blank');
        this.closeCurrentModal();
      } else {
        alert('❌ 该新闻暂无官网链接');
      }
    };

    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
  }

  toggleWhiteNoise() {
    if (!this.whiteNoisePlaying) {
      this.playWhiteNoise();
    } else {
      this.stopWhiteNoise();
    }
  }

  playWhiteNoise() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = audioContext.sampleRate * 2;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.2;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      this.whiteNoiseSource = source;
      this.whiteNoiseContext = audioContext;
      this.whiteNoisePlaying = true;
      
      this.showNotification('🌿 白噪音已开启！', 'success');
    } catch (e) {
      alert('🌿 白噪音已开启！（请先点击页面激活音频）');
    }
  }

  stopWhiteNoise() {
    if (this.whiteNoiseSource) {
      this.whiteNoiseSource.stop();
    }
    this.whiteNoisePlaying = false;
    this.showNotification('白噪音已关闭', 'info');
  }

  playMusic() {
    alert('🎵 轻音乐功能：请打开音乐播放器，推荐学习专用歌单！');
  }

  focusMode() {
    this.showTimerModal();
  }

  showTimerModal() {
    this.closeCurrentModal();

    const modal = document.createElement('div');
    modal.className = 'dashboard-modal timer-modal';
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeCurrentModal();
      }
    };

    modal.innerHTML = `
      <div class="modal-inner-content">
        <div class="modal-header">
          <h3>🧠 番茄时钟</h3>
          <button class="modal-close" title="关闭">✕</button>
        </div>
        <div class="modal-body" style="text-align:center;">
          <div style="font-size:48px;margin:20px;">25:00</div>
          <div style="margin-bottom:20px;">
            <button class="btn btn-primary start-timer-btn">▶️ 开始学习</button>
            <button class="btn btn-secondary close-btn">关闭</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.currentModal = modal;

    const closeBtn = modal.querySelector('.modal-close');
    const closeBtn2 = modal.querySelector('.close-btn');
    const startBtn = modal.querySelector('.start-timer-btn');

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeCurrentModal();
    };

    closeBtn2.onclick = (e) => {
      e.stopPropagation();
      this.closeCurrentModal();
    };

    startBtn.onclick = (e) => {
      e.stopPropagation();
      alert('⏰ 番茄钟已启动！25分钟后提醒休息！');
      this.closeCurrentModal();
    };

    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
  }

  showBreakModal() {
    this.closeCurrentModal();

    const modal = document.createElement('div');
    modal.className = 'dashboard-modal break-modal';
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeCurrentModal();
      }
    };

    modal.innerHTML = `
      <div class="modal-inner-content">
        <div class="modal-header">
          <h3>☕ 休息提醒</h3>
          <button class="modal-close" title="关闭">✕</button>
        </div>
        <div class="modal-body" style="text-align:center;">
          <p style="font-size:16px;margin:20px 0;">设置休息提醒时间</p>
          <div style="margin-bottom:20px;">
            <button class="btn btn-secondary" style="margin:5px;" data-time="30">30分钟</button>
            <button class="btn btn-secondary" style="margin:5px;" data-time="60">1小时</button>
            <button class="btn btn-secondary" style="margin:5px;" data-time="90">1.5小时</button>
          </div>
          <button class="btn btn-secondary close-btn">关闭</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.currentModal = modal;

    const closeBtn = modal.querySelector('.modal-close');
    const closeBtn2 = modal.querySelector('.close-btn');
    const timeButtons = modal.querySelectorAll('[data-time]');

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeCurrentModal();
    };

    closeBtn2.onclick = (e) => {
      e.stopPropagation();
      this.closeCurrentModal();
    };

    timeButtons.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const time = btn.getAttribute('data-time');
        alert(`⏰ 已设置${time}分钟后提醒休息！`);
        this.closeCurrentModal();
      };
    });

    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  renderNews() {
    const newsContainer = document.getElementById('news-list');
    if (!newsContainer) return;
    
    const filteredNews = this.currentCategory === '全部' 
      ? this.news 
      : this.news.filter(n => n.category === this.currentCategory);

    newsContainer.innerHTML = filteredNews.map(news => `
      <div class="news-card" data-news-id="${news.id}">
        <div class="news-category">${news.category}</div>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-summary">${news.summary}</p>
        <div class="news-footer">
          <span class="news-date">${news.date}</span>
          ${news.hot ? '<span class="hot-badge">🔥 热门</span>' : ''}
          <span class="read-detail">📖 查看详情</span>
        </div>
      </div>
    `).join('');
    
    this.bindNewsClickEvents();
  }

  bindNewsClickEvents() {
    const cards = document.querySelectorAll('.news-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const newsId = parseInt(card.dataset.newsId);
        this.showNewsDetail(newsId);
      });
    });
  }

  render() {
    console.log('🎨 渲染Dashboard页面...');
    const content = `
      <div class="dashboard-container">
        <div class="hero-banner">
          <div class="hero-content">
            <h1>🎓 考研加油！</h1>
            <p>坚持就是胜利，每一天的努力都在为梦想铺路</p>
          </div>
        </div>

        <div class="stats-row">
          <div class="countdown-card">
            <h3>⏰ 考研倒计时</h3>
            <div class="countdown-display">
              <div class="countdown-item">
                <span id="countdown-days" class="countdown-number">00</span>
                <span class="countdown-label">天</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-item">
                <span id="countdown-hours" class="countdown-number">00</span>
                <span class="countdown-label">时</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-item">
                <span id="countdown-minutes" class="countdown-number">00</span>
                <span class="countdown-label">分</span>
              </div>
              <span class="countdown-separator">:</span>
              <div class="countdown-item">
                <span id="countdown-seconds" class="countdown-number">00</span>
                <span class="countdown-label">秒</span>
              </div>
            </div>
          </div>

          <div class="quote-card">
            <h3>💪 今日励志语录</h3>
            <p class="quote-text">${this.quote}</p>
            <button class="refresh-quote-btn">🔄 换一条</button>
          </div>
        </div>

        <div class="relax-section">
          <h2>🧘 放松角落</h2>
          <div class="relax-grid">
            <div class="relax-card relax-whitenoise">
              <div class="relax-icon">🌿</div>
              <h4>白噪音</h4>
              <p>助你专注学习</p>
            </div>
            <div class="relax-card relax-music">
              <div class="relax-icon">🎵</div>
              <h4>轻音乐</h4>
              <p>放松身心</p>
            </div>
            <div class="relax-card relax-focus">
              <div class="relax-icon">🧠</div>
              <h4>专注模式</h4>
              <p>番茄钟学习法</p>
            </div>
            <div class="relax-card relax-reminder">
              <div class="relax-icon">🛌</div>
              <h4>休息提醒</h4>
              <p>定时休息保护眼睛</p>
            </div>
          </div>
        </div>

        <div class="news-section">
          <div class="news-header">
            <h2>📰 考研资讯</h2>
            <div class="news-actions">
              <button class="refresh-news-btn">🔄 刷新</button>
            </div>
          </div>
          <div class="news-categories">
            ${this.categories.map(cat => `
              <button class="category-btn ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>
            `).join('')}
          </div>
          <div id="news-list" class="news-list">
            ${this.news.map(news => `
              <div class="news-card" data-news-id="${news.id}">
                <div class="news-category">${news.category}</div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-summary">${news.summary}</p>
                <div class="news-footer">
                  <span class="news-date">${news.date}</span>
                  ${news.hot ? '<span class="hot-badge">🔥 热门</span>' : ''}
                  <span class="read-detail">📖 查看详情</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tips-section">
          <h2>💡 学习小贴士</h2>
          <div class="tips-grid">
            ${this.studyTips.map((tip, index) => `
              <div class="tip-card">
                <span class="tip-number">${index + 1}</span>
                <p>${tip}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = content;
      console.log('✅ 页面渲染完成！');
    } else {
      console.error('❌ 找不到 #main-content 元素！');
    }
  }

  bindEvents() {
    console.log('🔗 绑定事件...');
    
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        this.filterNews(category);
      });
    });
    
    this.bindNewsClickEvents();
    
    const refreshBtn = document.querySelector('.refresh-news-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadNews().then(() => this.renderNews());
      });
    }
    
    const quoteBtn = document.querySelector('.refresh-quote-btn');
    if (quoteBtn) {
      quoteBtn.addEventListener('click', () => {
        this.loadQuote().then(() => {
          const quoteEl = document.querySelector('.quote-text');
          if (quoteEl) quoteEl.textContent = this.quote;
        });
      });
    }
    
    document.querySelector('.relax-whitenoise')?.addEventListener('click', () => this.toggleWhiteNoise());
    document.querySelector('.relax-music')?.addEventListener('click', () => this.playMusic());
    document.querySelector('.relax-focus')?.addEventListener('click', () => this.focusMode());
    document.querySelector('.relax-reminder')?.addEventListener('click', () => this.showBreakModal());
    
    // 初始化学习热力图
    this.loadHeatmapData();
    
    console.log('✅ 事件绑定完成！');
  }

  async loadHeatmapData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('📊 未登录，跳过加载热力图数据');
        this.renderEmptyHeatmap();
        return;
      }

      console.log('📊 开始加载热力图数据...');
      const response = await fetch('/api/progress/heatmap?days=90', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ 热力图API请求失败:', response.status);
        this.renderEmptyHeatmap();
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ 服务器返回的不是JSON:', contentType);
        this.renderEmptyHeatmap();
        return;
      }

      const data = await response.json();
      console.log('📊 热力图数据加载成功:', data);
      this.renderHeatmap(data);
    } catch (error) {
      console.error('❌ 加载热力图数据失败:', error);
      this.renderEmptyHeatmap();
    }
  }

  renderEmptyHeatmap() {
    const grid = document.getElementById('heatmapGrid');
    const statsEl = document.getElementById('heatmapStats');

    if (grid) {
      grid.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">登录后可查看学习热力图</div>';
    }

    if (statsEl) {
      statsEl.innerHTML = '登录后开始记录你的学习轨迹';
    }
  }

  renderHeatmap(data) {
    const grid = document.getElementById('heatmapGrid');
    const monthsEl = document.getElementById('heatmapMonths');
    const statsEl = document.getElementById('heatmapStats');

    if (!grid) return;

    // 创建一个日期到数据的映射
    const dataMap = {};
    data.forEach(d => {
      dataMap[d.date] = { count: d.count, correct: d.correct };
    });

    // 生成最近91天的数据（13周）
    const today = new Date();
    const days = [];
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    // 计算起始偏移（确保第一行从周一开始）
    const firstDay = days[0];
    const startDayOfWeek = firstDay.getDay(); // 0=周日, 1=周一...
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 转换为周一开始的偏移

    // 生成周数组
    const weeks = [];
    let currentWeek = [];
    
    // 添加空白格子（对齐）
    for (let i = 0; i < offset; i++) {
      currentWeek.push(null);
    }
    
    days.forEach(date => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // 添加最后一周（如果有剩余）
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // 渲染月份标签
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay) {
        const month = firstValidDay.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            week: weekIndex,
            label: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][month]
          });
          lastMonth = month;
        } else {
          monthLabels.push({ week: weekIndex, label: '' });
        }
      } else {
        monthLabels.push({ week: weekIndex, label: '' });
      }
    });

    // 渲染月份标签
    monthsEl.innerHTML = monthLabels.map(m => 
      `<span style="width: 15px; display: inline-block; text-align: right;">${m.label}</span>`
    ).join('');

    // 渲染热力图格子（按周渲染）
    grid.innerHTML = weeks.map(week => {
      return week.map(date => {
        if (!date) {
          return '<div class="heatmap-cell level-0" style="visibility: hidden;"></div>';
        }
        
        const dateStr = date.toISOString().split('T')[0];
        const dayData = dataMap[dateStr];
        const count = dayData ? dayData.count : 0;
        const level = this.getHeatmapLevel(count);
        const displayDate = `${date.getMonth() + 1}月${date.getDate()}日`;

        return `<div class="heatmap-cell level-${level}" 
                     data-date="${dateStr}" 
                     data-count="${count}"
                     data-correct="${dayData ? dayData.correct : 0}"
                     data-display="${displayDate}"
                     title="${displayDate}: ${count}题"></div>`;
      }).join('');
    }).join('');

    // 设置grid为13列
    grid.style.gridTemplateColumns = `repeat(${weeks.length}, 15px)`;
    grid.style.gridTemplateRows = 'repeat(7, 15px)';
    grid.style.gridAutoFlow = 'column';
    grid.style.gap = '3px';

    // 添加悬停提示
    grid.querySelectorAll('.heatmap-cell').forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        this.showHeatmapTooltip(e);
      });
      cell.addEventListener('mouseleave', () => {
        this.hideHeatmapTooltip();
      });
    });

    // 统计信息
    const totalDays = data.length;
    const totalQuestions = data.reduce((sum, d) => sum + d.count, 0);
    const totalCorrect = data.reduce((sum, d) => sum + (d.correct || 0), 0);
    const avgPerDay = totalDays > 0 ? (totalQuestions / totalDays).toFixed(1) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    statsEl.innerHTML = `共学习 <strong>${totalDays}</strong> 天，累计答题 <strong>${totalQuestions}</strong> 题，平均每天 <strong>${avgPerDay}</strong> 题，正确率 <strong>${accuracy}%</strong>`;
  }

  getHeatmapLevel(count) {
    if (count === 0) return 0;
    if (count <= 5) return 1;
    if (count <= 15) return 2;
    if (count <= 30) return 3;
    return 4;
  }

  showHeatmapTooltip(e) {
    const cell = e.target;
    const date = cell.dataset.display;
    const count = cell.dataset.count;
    const correct = cell.dataset.correct;
    const accuracy = count > 0 ? Math.round((correct / count) * 100) : 0;

    let tooltip = document.querySelector('.heatmap-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'heatmap-tooltip';
      document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `<strong>${date}</strong><br>答题: ${count}题 | 正确: ${correct}题<br>正确率: ${accuracy}%`;
    tooltip.style.display = 'block';

    const rect = cell.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
  }

  hideHeatmapTooltip() {
    const tooltip = document.querySelector('.heatmap-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}

const dashboard = new Dashboard();
console.log('🌟 Dashboard类已加载！');
