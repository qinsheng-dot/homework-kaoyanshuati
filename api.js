const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  }

  async getQuestions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return this.request(`/questions?${params}`);
  }

  async getQuestion(id) {
    return this.request(`/questions/${id}`);
  }

  async getRandomQuestions(limit = 10, filters = {}) {
    const params = new URLSearchParams({ limit, ...filters });
    return this.request(`/questions/random?${params}`);
  }

  async getSubjects() {
    return this.request('/questions/subjects');
  }

  async getChapters(subject) {
    return this.request(`/questions/chapters?subject=${encodeURIComponent(subject)}`);
  }

  async register(username, email, password) {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async login(username, password) {
    const data = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  isLoggedIn() {
    return !!this.token;
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async getProgress() {
    return this.request('/users/progress');
  }

  async getFavorites() {
    return this.request('/users/favorites');
  }

  async addFavorite(questionId) {
    return this.request(`/users/favorites/${questionId}`, { method: 'POST' });
  }

  async removeFavorite(questionId) {
    return this.request(`/users/favorites/${questionId}`, { method: 'DELETE' });
  }

  async recordProgress(questionId, isCorrect, userAnswer) {
    let answerToSend = userAnswer;
    if (Array.isArray(userAnswer)) {
      answerToSend = userAnswer.join('');
    }
    return this.request('/progress', {
      method: 'POST',
      body: JSON.stringify({ questionId, isCorrect, userAnswer: answerToSend })
    });
  }

  async getWrongQuestions() {
    return this.request('/progress/wrong');
  }

  async getHistory(limit = 50) {
    return this.request(`/progress/history?limit=${limit}`);
  }

  async getStats(days = 7) {
    return this.request(`/progress/stats?days=${days}`);
  }

  async getChapterStats(subject) {
    return this.request(`/progress/chapter-stats?subject=${encodeURIComponent(subject)}`);
  }
}

const api = new ApiClient();
