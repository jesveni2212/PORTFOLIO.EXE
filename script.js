const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const familyData = {
  eterea: {
    label: 'ETÉREA',
    title: 'Tu aire es',
    name: 'Bruma',
    notes: ['iris', 'piel limpia', 'té blanco'],
    copy: 'Una presencia suave, luminosa y difícil de atrapar. Bruma se queda cerca de la piel y deja una sensación de calma despierta.',
    scentId: 'bruma'
  },
  amaderada: {
    label: 'AMADERADA',
    title: 'Tu pulso es',
    name: 'Cobre',
    notes: ['sándalo', 'ámbar', 'humo fino'],
    copy: 'Tenés gravedad. Cobre mezcla madera pulida, calor y una sombra elegante para acompañar los días que piden presencia.',
    scentId: 'cobre'
  },
  electrica: {
    label: 'ELÉCTRICA',
    title: 'Tu energía es',
    name: 'Volt',
    notes: ['yuzu', 'pimienta rosa', 'vetiver'],
    copy: 'Entrás encendiendo algo. Volt es cítrico, inquieto y brillante: una chispa limpia para moverte con intención.',
    scentId: 'volt'
  }
};

const questions = [
  {
    prompt: '¿Qué querés dejar en el ambiente?',
    options: [
      { label: 'Una estela de niebla', family: 'eterea' },
      { label: 'Una huella con raíces', family: 'amaderada' },
      { label: 'Una chispa imposible de ignorar', family: 'electrica' }
    ]
  },
  {
    prompt: '¿Cómo se mueve tu día?',
    options: [
      { label: 'Despacio, pero intenso', family: 'eterea' },
      { label: 'Con calma y dirección', family: 'amaderada' },
      { label: 'A toda luz', family: 'electrica' }
    ]
  },
  {
    prompt: '¿Qué textura te llama?',
    options: [
      { label: 'Una camisa blanca al sol', family: 'eterea' },
      { label: 'Madera tibia y piel', family: 'amaderada' },
      { label: 'Metal frío después de la lluvia', family: 'electrica' }
    ]
  }
];

const scentDetails = {
  bruma: 'BRUMA 02 · una salida limpia de iris, piel tibia y té blanco. Para cuando querés estar sin ocupar demasiado espacio.',
  cobre: 'COBRE 07 · sándalo cremoso, ámbar suave y un hilo de humo. Para presencias que no necesitan presentación.',
  volt: 'VOLT 11 · yuzu chispeante, pimienta rosa y vetiver verde. Para días que empiezan antes que todos.',
  noche: 'NOCHE 04 · ciruela oscura, cacao seco y almizcle. Para dejar una pregunta cuando ya te fuiste.'
};

const quizState = {
  step: 0,
  answers: []
};

function initReveal() {
  const revealItems = $$('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function calculateScores() {
  return quizState.answers.reduce((scores, answer) => {
    if (answer?.family) scores[answer.family] += 1;
    return scores;
  }, { eterea: 0, amaderada: 0, electrica: 0 });
}

function getRecommendation() {
  const scores = calculateScores();
  return Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([family]) => familyData[family])[0];
}

function renderQuizStep() {
  const stage = $('#quiz-stage');
  const kicker = $('#quiz-kicker');
  const progressLabel = $('#quiz-progress-label');
  const progressBar = $('#quiz-progress-bar');
  const backButton = $('#quiz-back');
  const question = questions[quizState.step];
  const stepNumber = String(quizState.step + 1).padStart(2, '0');

  kicker.textContent = `IMPULSO ${stepNumber}`;
  progressLabel.textContent = `${stepNumber} / 03`;
  progressBar.style.width = `${((quizState.step + 1) / questions.length) * 100}%`;
  backButton.hidden = quizState.step === 0;
  stage.innerHTML = `
    <div class="quiz-question">
      <h3>${question.prompt}</h3>
      <div class="quiz-options" role="group" aria-label="Opciones de respuesta">
        ${question.options.map((option, index) => `
          <button class="quiz-option" type="button" data-option-index="${index}">
            <span>${option.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  $$('.quiz-option', stage).forEach((button) => {
    button.addEventListener('click', () => {
      const option = question.options[Number(button.dataset.optionIndex)];
      quizState.answers[quizState.step] = option;

      if (quizState.step === questions.length - 1) {
        renderQuizResult();
        return;
      }

      quizState.step += 1;
      renderQuizStep();
    });
  });
}

function renderQuizResult() {
  const stage = $('#quiz-stage');
  const recommendation = getRecommendation() || familyData.eterea;
  const progressLabel = $('#quiz-progress-label');
  const progressBar = $('#quiz-progress-bar');
  const kicker = $('#quiz-kicker');
  const backButton = $('#quiz-back');

  kicker.textContent = 'TU DIRECCIÓN';
  progressLabel.textContent = '03 / 03';
  progressBar.style.width = '100%';
  backButton.hidden = false;
  stage.innerHTML = `
    <div class="quiz-result">
      <div>
        <p class="eyebrow">LECTURA COMPLETA</p>
        <div class="quiz-result__title" id="quiz-result-title"></div>
      </div>
      <div>
        <p class="quiz-result__copy" id="quiz-result-copy"></p>
        <div class="quiz-result__notes" id="quiz-result-notes" aria-label="Notas principales"></div>
        <div class="quiz-result__actions">
          <a class="button button--primary button--small" href="#collection" id="quiz-result-link">Abrir <span aria-hidden="true">↗</span></a>
          <button class="quiet-button" id="quiz-reset" type="button">Repetir lectura</button>
        </div>
      </div>
    </div>
  `;

  $('#quiz-result-title', stage).innerHTML = `${recommendation.title}<br /><em>${recommendation.name}.</em>`;
  $('#quiz-result-copy', stage).textContent = recommendation.copy;
  $('#quiz-result-notes', stage).innerHTML = recommendation.notes
    .map((note) => `<span>${note}</span>`)
    .join('');
  $('#quiz-reset').addEventListener('click', resetQuiz);
  $('#quiz-result-link', stage).addEventListener('click', () => {
    window.setTimeout(() => selectScent(recommendation.scentId), 350);
  });
}

function resetQuiz() {
  quizState.step = 0;
  quizState.answers = [];
  renderQuizStep();
}

function initQuiz() {
  $('#quiz-back').addEventListener('click', () => {
    if (quizState.step > 0) {
      quizState.step -= 1;
      renderQuizStep();
      return;
    }

    resetQuiz();
  });

  renderQuizStep();
}

function selectScent(scentId) {
  const detailText = $('#collection-detail-text');
  const selectedCard = $(`[data-scent-card="${scentId}"]`);

  $$('[data-scent-card]').forEach((card) => card.removeAttribute('data-selected'));
  selectedCard?.setAttribute('data-selected', 'true');
  detailText.textContent = scentDetails[scentId];
  detailText.parentElement.classList.add('is-open');
}

function initCollection() {
  $$('[data-scent-id]').forEach((button) => {
    button.addEventListener('click', () => selectScent(button.dataset.scentId));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initQuiz();
  initCollection();
});
