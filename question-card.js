const typeNames = {
  single: '单选题',
  multiple: '多选题',
  fill: '填空题',
  short: '简答题'
};

function renderQuestionCard(question, options = {}) {
  const { showAnswer = false, userAnswer = null, encouragement = '' } = options;

  const typeName = typeNames[question.type] || question.type;
  const difficultyStars = '★'.repeat(question.difficulty || 1) + '☆'.repeat(3 - (question.difficulty || 1));

  let optionsHtml = '';

  if (question.type === 'single' || question.type === 'multiple') {
    const optionsData = question.options || {};

    optionsHtml = Object.entries(optionsData).map(([key, value]) => {
      let classes = 'option-item';
      let disabledAttr = showAnswer ? 'disabled' : '';

      if (showAnswer && userAnswer) {
        if (Array.isArray(userAnswer)) {
          if (userAnswer.includes(key) && question.answer.includes(key)) {
            classes += ' correct';
          } else if (userAnswer.includes(key) && !question.answer.includes(key)) {
            classes += ' wrong';
          } else if (question.answer.includes(key)) {
            classes += ' correct';
          }
        } else {
          if (key === userAnswer && key === question.answer) {
            classes += ' correct';
          } else if (key === userAnswer && key !== question.answer) {
            classes += ' wrong';
          } else if (key === question.answer) {
            classes += ' correct';
          }
        }
      }

      return `
        <div class="${classes}" data-option="${key}" ${disabledAttr}>
          <span class="option-label">${key}.</span>
          <span class="option-text">${value}</span>
        </div>
      `;
    }).join('');
  } else if (question.type === 'fill') {
    optionsHtml = `
      <div class="form-group">
        <input type="text" class="fill-input" id="fillAnswer" placeholder="请输入答案"
          ${showAnswer ? 'disabled' : ''} value="${userAnswer || ''}">
      </div>
    `;
  } else if (question.type === 'short') {
    optionsHtml = `
      <div class="form-group">
        <textarea class="fill-input" id="shortAnswer" rows="4" placeholder="请输入答案"
          ${showAnswer ? 'disabled' : ''}>${userAnswer || ''}</textarea>
      </div>
    `;
  }

  let answerHtml = '';
  if (showAnswer) {
    let correctAnswer = question.answer;
    if (question.type === 'multiple') {
      correctAnswer = question.answer.split('').join('、');
    }

    const encouragementHtml = encouragement ? `
      <div style="margin-bottom: 12px; padding: 12px; background: #fff3cd; border-radius: 6px; border: 1px solid #ffeeba; text-align: center; font-size: 16px; font-weight: bold;">
        ${encouragement}
      </div>
    ` : '';

    answerHtml = `
      ${encouragementHtml}
      <div class="answer-section" style="margin-top: 20px; padding: 16px; background: #d4edda; border-radius: 6px; border: 1px solid #c3e6cb;">
        <p style="color: #155724;"><strong>正确答案:</strong> ${correctAnswer}</p>
        ${question.explanation ? `<p style="margin-top: 12px; color: #155724;"><strong>解析:</strong> ${question.explanation}</p>` : ''}
      </div>
    `;
  }

  let contentHtml = '';
  if (question.content.startsWith('Passage:')) {
    const parts = question.content.split('\n\n');
    const passage = parts[0].replace('Passage:', '').trim();
    const questionText = parts.slice(1).join('\n\n');
    
    contentHtml = `
      <div class="reading-passage" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h4 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">📖 阅读文章</h4>
        <p style="line-height: 1.8; color: #34495e; font-size: 15px;">${passage}</p>
      </div>
      <div class="question-content" style="padding: 16px; background: #fff; border-left: 4px solid #3498db;">
        <h5 style="margin-top: 0; margin-bottom: 8px; font-size: 16px; color: #2c3e50;">题目</h5>
        <p style="margin: 0; line-height: 1.6; color: #2c3e50;">${questionText}</p>
      </div>
    `;
  } else {
    contentHtml = `<div class="question-content">${question.content}</div>`;
  }

  return `
    <div class="question-header">
      <span class="question-type">${typeName}</span>
      <span class="question-difficulty">难度: ${difficultyStars}</span>
    </div>
    ${contentHtml}
    <div class="question-options">${optionsHtml}</div>
    ${answerHtml}
    <div class="question-actions">
      <button class="btn btn-secondary" id="prevQuestion" disabled>上一题</button>
      <button class="btn btn-primary" id="submitAnswer">提交答案</button>
      <button class="btn btn-secondary hidden" id="nextQuestion">下一题</button>
      <button class="btn btn-outline" id="favoriteBtn">☆ 收藏</button>
    </div>
  `;
}

function handleOptionClick(e) {
  const optionItem = e.target.closest('.option-item');
  if (!optionItem || optionItem.classList.contains('disabled')) return;

  const questionCard = optionItem.closest('.question-card');
  const questionTypeEl = questionCard?.querySelector('.question-type');
  if (!questionTypeEl) return;

  const questionType = questionTypeEl.textContent;

  if (questionType.includes('多选')) {
    optionItem.classList.toggle('selected');
  } else {
    questionCard.querySelectorAll('.option-item').forEach(item => {
      item.classList.remove('selected');
    });
    optionItem.classList.add('selected');
  }
}

function getSelectedAnswer(questionType) {
  const selected = document.querySelectorAll('.option-item.selected');
  if (questionType.includes('单选')) {
    return selected.length > 0 ? selected[0].dataset.option : null;
  } else if (questionType.includes('多选')) {
    return Array.from(selected).map(item => item.dataset.option).sort();
  } else if (questionType.includes('填空')) {
    const input = document.getElementById('fillAnswer');
    return input ? input.value : null;
  } else if (questionType.includes('简答')) {
    const textarea = document.getElementById('shortAnswer');
    return textarea ? textarea.value : null;
  }
  return null;
}
