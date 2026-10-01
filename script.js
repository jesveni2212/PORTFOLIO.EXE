const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const projectData = {
  informatica: {
    type: 'CASE / 01',
    title: '01 INFORMÁTICA',
    copy: 'Proyecto académico de informática convertido en una experiencia clara, modular y fácil de recorrer.',
    stack: 'HTML · CSS · JS',
    state: 'SHIPPED / 2026'
  },
  maf: {
    type: 'CASE / 02',
    title: 'MAF',
    copy: 'Plataforma de marca pensada para ordenar contenido, identidad y navegación dentro de una experiencia reconocible.',
    stack: 'UI · UX · JS',
    state: 'SHIPPED / 2026'
  },
  shir: {
    type: 'CASE / 03',
    title: 'SHIR',
    copy: 'Experiencia digital enfocada en convertir una idea de proyecto en una interfaz cercana, expresiva y memorable.',
    stack: 'HTML · CSS · MOTION',
    state: 'IN PROGRESS / 2026'
  }
};

const appState = {
  focusedWindow: 'welcome',
  highestZ: 31,
  booted: false
};

function finishBoot() {
  if (appState.booted) return;
  appState.booted = true;

  const bootScreen = $('#boot-screen');
  const systemShell = $('#system-shell');
  systemShell.classList.add('is-ready');
  systemShell.removeAttribute('aria-hidden');
  bootScreen.classList.add('is-done');
  window.setTimeout(() => bootScreen.remove(), 600);
  openWindow('welcome');
}

function initBoot() {
  const lines = $$('[data-boot-line]');
  const progress = $('#boot-progress-bar');
  const status = $('#boot-status');
  const skip = $('#boot-skip');
  const bootMessages = ['checking memory...', 'loading interface...', 'desktop ready.'];
  let timer;

  lines.forEach((line, index) => {
    window.setTimeout(() => {
      line.classList.add('is-visible');
      progress.style.width = `${Math.min(92, (index + 1) * 22)}%`;
      status.textContent = bootMessages[index] || 'system ready.';
    }, 420 + index * 330);
  });

  timer = window.setTimeout(() => {
    progress.style.width = '100%';
    status.textContent = 'system ready.';
    finishBoot();
  }, 2050);

  skip.addEventListener('click', () => {
    window.clearTimeout(timer);
    lines.forEach((line) => line.classList.add('is-visible'));
    progress.style.width = '100%';
    status.textContent = 'system ready.';
    finishBoot();
  });
}

function getWindow(windowId) {
  return $(`[data-window="${windowId}"]`);
}

function getTaskButton(windowId) {
  return $(`#taskbar-apps [data-open-window="${windowId}"]`);
}

function ensureTaskButton(windowId) {
  const existing = getTaskButton(windowId);
  if (existing) return existing;

  const taskbarApps = $('#taskbar-apps');
  const windowElement = getWindow(windowId);
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.openWindow = windowId;
  button.textContent = windowElement?.dataset.windowTitle || windowId.toUpperCase();
  taskbarApps.append(button);
  button.addEventListener('click', () => {
    const target = getWindow(windowId);
    if (target && !target.hidden) {
      hideWindow(windowId);
    } else {
      openWindow(windowId);
    }
  });
  return button;
}

function focusWindow(windowId) {
  const windowElement = getWindow(windowId);
  if (!windowElement) return;

  appState.highestZ += 1;
  appState.focusedWindow = windowId;
  $$('[data-window]').forEach((item) => {
    item.classList.toggle('is-focused', item === windowElement);
    if (item !== windowElement) item.style.zIndex = '1';
  });
  windowElement.style.zIndex = appState.highestZ;
  $$('#taskbar-apps [data-open-window]').forEach((button) => button.classList.toggle('is-active', button.dataset.openWindow === windowId));
}

function openWindow(windowId) {
  const windowElement = getWindow(windowId);
  if (!windowElement) return;

  windowElement.hidden = false;
  windowElement.classList.remove('is-minimized');
  const taskButton = ensureTaskButton(windowId);
  taskButton.classList.add('is-visible');
  focusWindow(windowId);

  if (windowId === 'terminal') {
    window.setTimeout(() => $('#terminal-input')?.focus(), 0);
  }
}

function hideWindow(windowId, removeTask = false) {
  const windowElement = getWindow(windowId);
  const taskButton = getTaskButton(windowId);
  if (!windowElement) return;

  windowElement.hidden = true;
  windowElement.classList.remove('is-focused');
  if (removeTask) taskButton?.classList.remove('is-visible', 'is-active');

  if (appState.focusedWindow === windowId) {
    const nextWindow = $$('[data-window]')
      .filter((item) => !item.hidden)
      .sort((first, second) => (Number(second.style.zIndex) || 1) - (Number(first.style.zIndex) || 1))[0];

    if (nextWindow) {
      focusWindow(nextWindow.dataset.window);
    } else {
      appState.focusedWindow = null;
      $$('#taskbar-apps [data-open-window]').forEach((button) => button.classList.remove('is-active'));
    }
  }
}

function initWindowManager() {
  $$('[data-open-window]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const windowId = trigger.dataset.openWindow;
      if (windowId) openWindow(windowId);
      $('#start-menu').hidden = true;
    });
  });

  $$('[data-window-action]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      const windowElement = control.closest('[data-window]');
      const windowId = windowElement?.dataset.window;
      if (!windowId) return;

      if (control.dataset.windowAction === 'close') hideWindow(windowId, true);
      if (control.dataset.windowAction === 'minimize') hideWindow(windowId);
    });
  });

  $$('[data-window]').forEach((windowElement) => {
    windowElement.addEventListener('pointerdown', () => focusWindow(windowElement.dataset.window));
  });

  initDragging();
}

function initDragging() {
  let dragState = null;

  $$('[data-window] .window-titlebar').forEach((bar) => {
    bar.addEventListener('pointerdown', (event) => {
      const windowElement = bar.closest('[data-window]');
      const windowControl = event.target instanceof Element ? event.target.closest('[data-window-action]') : null;
      if (!windowElement || window.matchMedia('(pointer: coarse)').matches || event.button !== 0 || windowControl) return;
      focusWindow(windowElement.dataset.window);
      const bounds = windowElement.getBoundingClientRect();
      windowElement.style.transform = 'none';
      windowElement.style.left = `${bounds.left}px`;
      windowElement.style.top = `${bounds.top - 38}px`;
      windowElement.style.right = 'auto';
      windowElement.style.bottom = 'auto';
      dragState = { windowElement, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
      bar.setPointerCapture?.(event.pointerId);
    });
  });

  document.addEventListener('pointermove', (event) => {
    if (!dragState) return;
    const { windowElement, offsetX, offsetY } = dragState;
    const desktop = $('#desktop').getBoundingClientRect();
    const nextLeft = Math.max(8, Math.min(desktop.width - windowElement.offsetWidth - 8, event.clientX - desktop.left - offsetX));
    const nextTop = Math.max(8, Math.min(desktop.height - windowElement.offsetHeight - 8, event.clientY - desktop.top - offsetY));
    windowElement.style.left = `${nextLeft}px`;
    windowElement.style.top = `${nextTop}px`;
  });

  document.addEventListener('pointerup', () => {
    dragState = null;
  });
}

function initProjectMap() {
  const detailType = $('#project-detail-type');
  const detailTitle = $('#project-detail-title');
  const detailCopy = $('#project-detail-copy');
  const detailStack = $('#project-detail-stack');
  const detailState = $('#project-detail-state');

  $$('[data-project]').forEach((node) => {
    node.addEventListener('click', () => {
      const project = projectData[node.dataset.project];
      if (!project) return;

      $$('[data-project]').forEach((item) => item.classList.toggle('is-selected', item === node));
      detailType.textContent = project.type;
      detailTitle.textContent = project.title;
      detailCopy.textContent = project.copy;
      detailStack.textContent = project.stack;
      detailState.textContent = project.state;
    });
  });
}

function appendTerminalLine(content, className = '') {
  const output = $('#terminal-output');
  const paragraph = document.createElement('p');
  paragraph.className = className;
  paragraph.innerHTML = content;
  output.append(paragraph);
  output.scrollTop = output.scrollHeight;
}

function initTerminal() {
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  if (!form || !input) return;

  const commandOutput = {
    help: '<span class="terminal-green">AVAILABLE COMMANDS</span><br />about · projects · skills · contact<br />clear · whoami · status',
    whoami: 'guest@portfolio — curious human / frontend maker',
    status: '<span class="terminal-green">SYSTEM STATUS:</span> online / idea engine warm / no bugs found (probably)',
    about: 'opening ABOUT.EXE...',
    projects: 'opening PROJECTS...',
    skills: 'loading SKILLS.SYS...',
    contact: 'opening CONTACT.EXE...'
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = input.value.trim().toLowerCase();
    if (!command) return;

    appendTerminalLine(`<span class="terminal-amber">C:\\PORTFOLIO&gt;</span> ${command}`);
    input.value = '';

    if (command === 'clear') {
      $('#terminal-output').innerHTML = '';
      return;
    }

    if (command === 'reboot') {
      appendTerminalLine('reboot disabled in demo mode. click START → Restart system.', 'terminal-amber');
      return;
    }

    const output = commandOutput[command] || `command not found: ${command}. try <b>help</b>`;
    appendTerminalLine(output);
    if (['about', 'projects', 'skills', 'contact'].includes(command)) openWindow(command);
  });
}

function initStartMenu() {
  const startButton = $('#start-button');
  const menu = $('#start-menu');
  startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== startButton) menu.hidden = true;
  });

  $('#restart-button').addEventListener('click', () => {
    menu.hidden = true;
    $$('[data-window]').forEach((windowElement) => {
      if (windowElement.dataset.window !== 'welcome') hideWindow(windowElement.dataset.window, true);
    });
    openWindow('welcome');
  });
}

function initContact() {
  $('[data-copy-contact]')?.addEventListener('click', async (event) => {
    event.preventDefault();
    const status = $('#contact-status');
    try {
      await navigator.clipboard.writeText('hola@portfolio.exe');
      status.textContent = 'CONTACT COPIED / READY';
    } catch {
      status.textContent = 'SELECTED: hola@portfolio.exe';
    }
  });
}

function initContrast() {
  const button = $('#contrast-toggle');
  button.addEventListener('click', () => {
    const shell = $('#system-shell');
    const enabled = shell.classList.toggle('is-contrast');
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? '◑ contraste +' : '◐ contraste';
  });
}

function initClocks() {
  const topClock = $('#top-clock');
  const taskbarClock = $('#taskbar-clock');
  const update = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    topClock.textContent = time;
    taskbarClock.textContent = time.slice(0, 5);
  };
  update();
  window.setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  initBoot();
  initWindowManager();
  initProjectMap();
  initTerminal();
  initStartMenu();
  initContact();
  initContrast();
  initClocks();
});
