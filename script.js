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

const scentCatalog = {
  bruma: {
    code: 'A—01',
    family: 'ETÉREA',
    name: 'Bruma',
    number: '02',
    copy: 'Una presencia suave, luminosa y difícil de atrapar. Bruma se queda cerca de la piel y deja una sensación de calma despierta.',
    notes: 'iris · piel limpia · té blanco',
    projection: 'cerca de la piel',
    moment: 'mañanas lentas',
    visualClass: 'mist'
  },
  cobre: {
    code: 'W—07',
    family: 'AMADERADA',
    name: 'Cobre',
    number: '07',
    copy: 'Tenés gravedad. Cobre mezcla madera pulida, calor y una sombra elegante para acompañar los días que piden presencia.',
    notes: 'sándalo · ámbar · humo fino',
    projection: 'estela media',
    moment: 'horas doradas',
    visualClass: 'wood'
  },
  volt: {
    code: 'E—11',
    family: 'ELÉCTRICA',
    name: 'Volt',
    number: '11',
    copy: 'Entrás encendiendo algo. Volt es cítrico, inquieto y brillante: una chispa limpia para moverte con intención.',
    notes: 'yuzu · pimienta rosa · vetiver',
    projection: 'estela amplia',
    moment: 'días en movimiento',
    visualClass: 'electric'
  },
  noche: {
    code: 'N—04',
    family: 'NOCTURNA',
    name: 'Noche',
    number: '04',
    copy: 'Ciruela oscura, cacao seco y almizcle. Una composición para dejar una pregunta cuando ya te fuiste.',
    notes: 'ciruela · cacao · almizcle',
    projection: 'estela envolvente',
    moment: 'después del atardecer',
    visualClass: 'night'
  }
};

const moodData = {
  quiet: {
    kicker: 'QUIET / 01',
    family: 'ETÉREA',
    title: 'Una presencia<br /><em>casi secreta.</em>',
    copy: 'Luz baja, piel limpia y una estela que se queda cerca. Tu dirección: Bruma 02.',
    meter: 28
  },
  solar: {
    kicker: 'SOLAR / 02',
    family: 'ELÉCTRICA',
    title: 'Entrá dejando<br /><em>la luz prendida.</em>',
    copy: 'Cítrico, brillante y en movimiento. Tu dirección: Volt 11.',
    meter: 74
  },
  grounded: {
    kicker: 'GROUNDED / 03',
    family: 'AMADERADA',
    title: 'Todo vuelve<br /><em>a su centro.</em>',
    copy: 'Calor, textura y una forma tranquila de ocupar el espacio. Tu dirección: Cobre 07.',
    meter: 56
  },
  nocturnal: {
    kicker: 'NOCTURNAL / 04',
    family: 'NOCTURNA',
    title: 'La noche guarda<br /><em>lo que no decís.</em>',
    copy: 'Oscura, suave y magnética. Tu dirección: Noche 04.',
    meter: 86
  }
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

function initAtmosphere() {
  const canvas = $('#atmosphere-canvas');
  const visual = $('.hero__visual');
  const toggle = $('#ambient-toggle');
  const toggleLabel = $('#ambient-toggle-label');
  const intensity = $('#ambient-intensity');
  const intensityValue = $('#ambient-intensity-value');
  const status = $('#ambient-status');
  const consoleElement = $('.ambient-console');

  if (!canvas || !visual || !toggle || !intensity) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    active: false,
    intensity: Number(intensity.value),
    width: 0,
    height: 0,
    particles: []
  };

  const makeParticles = () => {
    const count = Math.max(42, Math.min(86, Math.round(state.width / 7)));
    state.particles = Array.from({ length: count }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      radius: Math.random() * 1.5 + 0.35,
      speed: Math.random() * 0.28 + 0.06,
      phase: Math.random() * Math.PI * 2,
      tone: Math.random() > 0.45 ? 'lime' : 'lavender'
    }));
  };

  const resize = () => {
    const bounds = visual.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    state.width = bounds.width;
    state.height = bounds.height;
    canvas.width = Math.round(state.width * ratio);
    canvas.height = Math.round(state.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    makeParticles();
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, state.width, state.height);
    const strength = state.intensity / 100;

    state.particles.forEach((particle) => {
      if (!reducedMotion) {
        particle.y -= particle.speed * (state.active ? 1.6 : 0.45);
        particle.x += Math.sin(time / 1500 + particle.phase) * 0.08;
        if (particle.y < -8) particle.y = state.height + 8;
        if (particle.x < -8) particle.x = state.width + 8;
        if (particle.x > state.width + 8) particle.x = -8;
      }

      const color = particle.tone === 'lime' ? '215, 255, 99' : '185, 169, 255';
      context.beginPath();
      context.fillStyle = `rgba(${color}, ${0.16 + strength * 0.55})`;
      context.arc(particle.x, particle.y, particle.radius * (state.active ? 1.35 : 1), 0, Math.PI * 2);
      context.fill();
    });

    if (!reducedMotion) window.requestAnimationFrame(draw);
  };

  const setActive = (active) => {
    state.active = active;
    toggle.setAttribute('aria-pressed', String(active));
    toggleLabel.textContent = active ? 'Pausar aura' : 'Activar aura';
    status.textContent = active
      ? `Aura activa · intensidad ${state.intensity}%.`
      : 'Aura en reposo · elegí una intensidad.';
    consoleElement.classList.toggle('is-active', active);
    visual.classList.toggle('is-immersive', active);
  };

  toggle.addEventListener('click', () => setActive(!state.active));
  intensity.addEventListener('input', () => {
    state.intensity = Number(intensity.value);
    intensityValue.textContent = `${state.intensity}%`;
    if (state.active) status.textContent = `Aura activa · intensidad ${state.intensity}%.`;
  });

  if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
    visual.addEventListener('pointermove', (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
      visual.style.setProperty('--pointer-x', `${x}px`);
      visual.style.setProperty('--pointer-y', `${y}px`);
    });

    visual.addEventListener('pointerleave', () => {
      visual.style.setProperty('--pointer-x', '0px');
      visual.style.setProperty('--pointer-y', '0px');
    });
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  draw();
}

function initMoodLab() {
  const display = $('#mood-display');
  const kicker = $('#mood-kicker');
  const family = $('#mood-family');
  const title = $('#mood-title');
  const copy = $('#mood-copy');
  const meter = $('#mood-meter-fill');
  const meterLabel = $('#mood-meter-label');
  const buttons = $$('[data-mood]');

  if (!display || !kicker || !family || !title || !copy || !meter || !meterLabel) return;

  const renderMood = (moodId) => {
    const mood = moodData[moodId];
    if (!mood) return;

    display.dataset.mood = moodId;
    kicker.textContent = mood.kicker;
    family.textContent = mood.family;
    title.innerHTML = mood.title;
    copy.textContent = mood.copy;
    meter.style.width = `${mood.meter}%`;
    meterLabel.textContent = `intensidad ${String(mood.meter).padStart(2, '0')} / 100`;
    buttons.forEach((button) => button.classList.toggle('is-active', button.dataset.mood === moodId));
  };

  buttons.forEach((button) => button.addEventListener('click', () => renderMood(button.dataset.mood)));
  renderMood('quiet');
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

function openScentModal(scentId) {
  const scent = scentCatalog[scentId];
  const modal = $('#scent-modal');
  if (!scent || !modal) return;

  $('#scent-modal-code').textContent = scent.code;
  $('#scent-modal-family').textContent = scent.family;
  $('#scent-modal-title').innerHTML = `${scent.name} <sup>${scent.number}</sup>`;
  $('#scent-modal-copy').textContent = scent.copy;
  $('#scent-modal-notes').textContent = scent.notes;
  $('#scent-modal-projection').textContent = scent.projection;
  $('#scent-modal-moment').textContent = scent.moment;

  const visual = $('#scent-modal-visual');
  visual.className = `scent-modal__visual scent-modal__visual--${scent.visualClass}`;

  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function selectScent(scentId, shouldOpenModal = false) {
  const detailText = $('#collection-detail-text');
  const selectedCard = $(`[data-scent-card="${scentId}"]`);

  $$('[data-scent-card]').forEach((card) => card.removeAttribute('data-selected'));
  selectedCard?.setAttribute('data-selected', 'true');
  detailText.textContent = scentDetails[scentId];
  detailText.parentElement.classList.add('is-open');
  if (shouldOpenModal) openScentModal(scentId);
}

function initCollection() {
  $$('[data-scent-id]').forEach((button) => {
    button.addEventListener('click', () => selectScent(button.dataset.scentId, true));
  });

  $('#scent-modal-cta')?.addEventListener('click', () => {
    const modal = $('#scent-modal');
    if (modal?.open) modal.close();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initAtmosphere();
  initMoodLab();
  initQuiz();
  initCollection();
});
