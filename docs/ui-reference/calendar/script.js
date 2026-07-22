/* ============================================================
   Vantage — Calendar
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Constants & mock data
   ============================================================ */
const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];
const CATEGORY_COLOR = { work: 'var(--cat-work)', personal: 'var(--cat-personal)', team: 'var(--cat-team)', deadline: 'var(--cat-deadline)' };
const CATEGORY_LABEL = { work: 'Work', personal: 'Personal', team: 'Team', deadline: 'Deadlines' };
const WEEK_START_HOUR = 7;
const WEEK_END_HOUR = 21;
const HOUR_PX = 60;

const today = new Date();
today.setHours(0, 0, 0, 0);

function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function sameDay(a, b) { return isoDate(a) === isoDate(b); }
function timeToMinutes(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

const EVENT_SEEDS = [
  { title: 'チームスタンドアップ', offset: 0, start: '09:00', end: '09:15', category: 'team', location: 'Huddle' },
  { title: 'デザインレビュー', offset: 0, start: '10:00', end: '11:00', category: 'work', location: 'Zoom' },
  { title: 'ランチ MTG', offset: 0, start: '12:30', end: '13:30', category: 'personal', location: 'Blue Bottle Coffee' },
  { title: '決済フロー PR 締切', offset: 0, start: '18:00', end: '18:30', category: 'deadline' },
  { title: '1on1 with Tom', offset: 1, start: '14:00', end: '14:30', category: 'work' },
  { title: 'プロダクトプランニング', offset: 2, start: '10:00', end: '12:00', category: 'team', location: 'Room A' },
  { title: '歯医者', offset: 3, start: '16:00', end: '17:00', category: 'personal' },
  { title: 'デザインクリティーク', offset: 4, start: '10:30', end: '11:30', category: 'work' },
  { title: '採用面接', offset: 4, start: '13:00', end: '14:00', category: 'work', location: 'Zoom' },
  { title: 'Q3ロードマップ締切', offset: 5, start: '17:00', end: '17:30', category: 'deadline' },
  { title: 'ヨガクラス', offset: 6, start: '07:30', end: '08:30', category: 'personal' },
  { title: '全社会議', offset: 8, start: '16:00', end: '17:00', category: 'team', location: 'Main Hall' },
  { title: 'マーケサイト公開締切', offset: 9, start: '12:00', end: '12:30', category: 'deadline' },
  { title: 'デザインシステム同期', offset: -2, start: '11:00', end: '11:30', category: 'work' },
  { title: '週次レトロ', offset: -1, start: '15:00', end: '15:45', category: 'team' },
  { title: 'カスタマーインタビュー', offset: -4, start: '09:30', end: '10:15', category: 'work' },
  { title: '経費精算締切', offset: -6, start: '17:00', end: '17:15', category: 'deadline' },
  { title: 'ジム', offset: -3, start: '18:30', end: '19:30', category: 'personal' },
  { title: 'スプリントレビュー', offset: 13, start: '11:00', end: '12:00', category: 'team' },
  { title: '契約更新締切', offset: 16, start: '17:00', end: '17:30', category: 'deadline' },
];

let EVENTS = [];
let eventSeq = 1;
function buildEvents() {
  EVENTS = EVENT_SEEDS.map((seed) => ({
    id: `ev${eventSeq++}`,
    title: seed.title,
    date: isoDate(addDays(today, seed.offset)),
    start: seed.start,
    end: seed.end,
    category: seed.category,
    location: seed.location || '',
  }));
}

const state = {
  view: 'month',
  currentDate: new Date(today),
  selectedDate: new Date(today),
  visibleCategories: new Set(['work', 'personal', 'team', 'deadline']),
};

/* ============================================================
   1. Toasts
   ============================================================ */
function showToast(message) {
  const host = $('#toastHost');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${message}</span>`;
  host.appendChild(toast);
  gsap.fromTo(toast, { y: -16, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
  setTimeout(() => {
    gsap.to(toast, { y: -12, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => toast.remove() });
  }, 2800);
}

/* ============================================================
   2. Sidebar (app shell) + generic dropdown
   ============================================================ */
function initShellSidebar() {
  const sidebar = $('#sidebar');
  $('#sidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('is-collapsed'));
  $('#mobileSidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('is-mobile-open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    if (!sidebar.classList.contains('is-mobile-open')) return;
    if (sidebar.contains(e.target) || e.target.closest('#mobileSidebarToggle')) return;
    sidebar.classList.remove('is-mobile-open');
  });
}

function createDropdown(trigger, panel) {
  if (!trigger || !panel) return null;
  function open() {
    closeAllDropdowns();
    panel.classList.add('is-open');
    gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out' });
  }
  function close() {
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.16, onComplete: () => panel.classList.remove('is-open') });
  }
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('is-open') ? close() : open();
  });
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('is-open')) return;
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return { open, close };
}

function closeAllDropdowns() {
  $$('.dropdown.is-open').forEach((panel) => {
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.14, onComplete: () => panel.classList.remove('is-open') });
  });
}

function openFloating(panel, trigger, { align = 'left' } = {}) {
  closeAllDropdowns();
  const rect = trigger.getBoundingClientRect();
  panel.style.position = 'fixed';
  panel.style.top = `${rect.bottom + 8}px`;
  const left = align === 'right' ? rect.right - panel.offsetWidth : rect.left;
  panel.style.left = `${Math.max(12, Math.min(left, window.innerWidth - panel.offsetWidth - 12))}px`;
  panel.style.right = 'auto';
  panel.classList.add('is-open');
  gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, ease: 'power3.out' });
  const closeHandler = (e) => {
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.14, onComplete: () => panel.classList.remove('is-open') });
    document.removeEventListener('click', closeHandler);
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

function initTopbarPopovers() {
  createDropdown($('#notifBtn'), $('#notifDropdown'));
  createDropdown($('#profileBtn'), $('#profileDropdown'));
  $('#clearNotifs')?.addEventListener('click', () => {
    $('#notifList').style.display = 'none';
    $('#notifEmpty').classList.add('is-visible');
    $('#notifBadge').style.display = 'none';
    showToast('すべての通知を既読にしました');
  });
}

/* ============================================================
   3. Event helpers
   ============================================================ */
function visibleEventsForDate(dateIso) {
  return EVENTS
    .filter((e) => e.date === dateIso && state.visibleCategories.has(e.category))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

/* ============================================================
   4. Toolbar: today / prev / next / view toggle
   ============================================================ */
function initToolbar() {
  $('#todayBtn')?.addEventListener('click', () => {
    state.currentDate = new Date(today);
    state.selectedDate = new Date(today);
    renderAll('none');
    showToast('今日に移動しました');
  });
  $('#prevBtn')?.addEventListener('click', () => navigate(-1));
  $('#nextBtn')?.addEventListener('click', () => navigate(1));

  $('#viewMonth')?.addEventListener('click', () => switchView('month'));
  $('#viewWeek')?.addEventListener('click', () => switchView('week'));

  $('#cmdkGoToday')?.addEventListener('click', () => {
    state.currentDate = new Date(today);
    state.selectedDate = new Date(today);
    renderAll('none');
  });
}

function navigate(direction) {
  if (state.view === 'month') {
    state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + direction, 1);
  } else {
    state.currentDate = addDays(state.currentDate, direction * 7);
  }
  renderAll(direction > 0 ? 'forward' : 'back');
}

function switchView(view) {
  if (state.view === view) return;
  state.view = view;
  $('#viewMonth').classList.toggle('is-active', view === 'month');
  $('#viewWeek').classList.toggle('is-active', view === 'week');

  const monthEl = $('#calMonth');
  const weekEl = $('#calWeek');
  if (view === 'month') {
    weekEl.hidden = true;
    monthEl.hidden = false;
    gsap.fromTo(monthEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  } else {
    monthEl.hidden = true;
    weekEl.hidden = false;
    gsap.fromTo(weekEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }
  renderAll('none');
}

/* ============================================================
   5. Month view
   ============================================================ */
function renderMonth() {
  const grid = $('#monthGrid');
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  let startOffset = firstOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const gridStart = addDays(firstOfMonth, -startOffset);

  let html = '';
  for (let i = 0; i < 42; i++) {
    const cellDate = addDays(gridStart, i);
    const iso = isoDate(cellDate);
    const isOutside = cellDate.getMonth() !== month;
    const isToday = sameDay(cellDate, today);
    const isSelected = sameDay(cellDate, state.selectedDate);
    const events = visibleEventsForDate(iso);
    const shown = events.slice(0, 3);
    const extra = events.length - shown.length;

    html += `
      <div class="cal-day ${isOutside ? 'is-outside' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${iso}">
        <span class="cal-day__num">${cellDate.getDate()}</span>
        <div class="cal-day__events">
          ${shown.map((e) => `<div class="cal-event-pill" data-event-id="${e.id}" style="--ec:${CATEGORY_COLOR[e.category]}" data-tooltip="${e.start} ${e.title}">${e.title}</div>`).join('')}
          ${extra > 0 ? `<div class="cal-day__more" data-date="${iso}">+${extra} 件</div>` : ''}
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;
  bindMonthEvents();
}

function bindMonthEvents() {
  $$('.cal-day').forEach((dayEl) => {
    dayEl.addEventListener('click', (e) => {
      if (e.target.closest('.cal-day__more')) return;
      const iso = dayEl.getAttribute('data-date');
      selectDate(new Date(`${iso}T00:00:00`));
    });
  });
  $$('.cal-event-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const ev = EVENTS.find((x) => x.id === pill.getAttribute('data-event-id'));
      if (ev) showToast(`${ev.start}–${ev.end} 「${ev.title}」`);
    });
    pill.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation();
      openEventContextMenu(e.clientX, e.clientY, pill.getAttribute('data-event-id'));
    });
  });
  $$('.cal-day__more').forEach((moreEl) => {
    moreEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const iso = moreEl.getAttribute('data-date');
      openDayEventsPopover(moreEl, iso);
    });
  });
}

function openDayEventsPopover(trigger, iso) {
  const popover = $('#dayEventsPopover');
  const events = visibleEventsForDate(iso);
  const d = new Date(`${iso}T00:00:00`);
  $('#dayEventsPopoverDate').textContent = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(d);
  $('#dayEventsPopoverList').innerHTML = events.map((e) => `
    <div class="day-event-row" data-event-id="${e.id}">
      <span class="day-event-row__dot" style="--ec:${CATEGORY_COLOR[e.category]}"></span>
      <span class="day-event-row__time">${e.start}</span>
      <span class="day-event-row__title">${e.title}</span>
    </div>
  `).join('');
  $$('.day-event-row', popover).forEach((row) => {
    row.addEventListener('click', () => {
      const ev = EVENTS.find((x) => x.id === row.getAttribute('data-event-id'));
      if (ev) showToast(`${ev.start}–${ev.end} 「${ev.title}」`);
    });
  });
  openFloating(popover, trigger, { align: 'left' });
}

/* ============================================================
   6. Week view
   ============================================================ */
function getWeekStart(date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function renderWeek() {
  const weekStart = getWeekStart(state.currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const head = $('#weekHead');
  head.innerHTML = `<div></div>` + days.map((d) => `
    <div class="cal-week__head-cell ${sameDay(d, today) ? 'is-today' : ''}" data-date="${isoDate(d)}">
      <span class="cal-week__head-weekday">${WEEKDAY_JA[d.getDay()]}</span>
      <span class="cal-week__head-day">${d.getDate()}</span>
    </div>
  `).join('');
  $$('.cal-week__head-cell', head).forEach((cell) => {
    cell.addEventListener('click', () => selectDate(new Date(`${cell.getAttribute('data-date')}T00:00:00`)));
  });

  const hoursEl = $('#weekHours');
  let hoursHtml = '';
  for (let h = WEEK_START_HOUR; h <= WEEK_END_HOUR; h++) {
    hoursHtml += `<span class="cal-week__hour-label">${pad(h)}:00</span>`;
  }
  hoursEl.innerHTML = hoursHtml;
  hoursEl.style.paddingTop = `${HOUR_PX / 2}px`;
  $$('.cal-week__hour-label', hoursEl).forEach((el) => { el.style.height = `${HOUR_PX}px`; });

  const totalHeight = (WEEK_END_HOUR - WEEK_START_HOUR + 1) * HOUR_PX;
  const columnsEl = $('#weekColumns');
  columnsEl.style.height = `${totalHeight}px`;
  columnsEl.innerHTML = days.map((d) => {
    const iso = isoDate(d);
    const events = visibleEventsForDate(iso);
    const blocks = events.map((e) => {
      const startMin = Math.max(timeToMinutes(e.start), WEEK_START_HOUR * 60);
      const endMin = Math.min(timeToMinutes(e.end), (WEEK_END_HOUR + 1) * 60);
      const top = ((startMin - WEEK_START_HOUR * 60) / 60) * HOUR_PX;
      const height = Math.max((((endMin - startMin) / 60) * HOUR_PX) - 3, 20);
      return `
        <div class="cal-event-block" data-event-id="${e.id}" style="--ec:${CATEGORY_COLOR[e.category]}; top:${top}px; height:${height}px;">
          ${e.title}<span class="cal-event-block__time">${e.start}–${e.end}</span>
        </div>
      `;
    }).join('');
    const isToday = sameDay(d, today);
    let nowLine = '';
    if (isToday) {
      const nm = nowMinutes();
      if (nm >= WEEK_START_HOUR * 60 && nm <= (WEEK_END_HOUR + 1) * 60) {
        const top = ((nm - WEEK_START_HOUR * 60) / 60) * HOUR_PX;
        nowLine = `<div class="cal-week__now-line" style="top:${top}px"></div>`;
      }
    }
    return `<div class="cal-week__column ${isToday ? 'is-today-col' : ''}" style="height:${totalHeight}px">${blocks}${nowLine}</div>`;
  }).join('');

  $$('.cal-event-block', columnsEl).forEach((block) => {
    block.addEventListener('click', () => {
      const ev = EVENTS.find((x) => x.id === block.getAttribute('data-event-id'));
      if (ev) showToast(`${ev.start}–${ev.end} 「${ev.title}」`);
    });
    block.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openEventContextMenu(e.clientX, e.clientY, block.getAttribute('data-event-id'));
    });
  });
}

/* ============================================================
   7. Period label
   ============================================================ */
function renderPeriodLabel() {
  const label = $('#periodLabel');
  let text;
  if (state.view === 'month') {
    text = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' }).format(state.currentDate);
  } else {
    const weekStart = getWeekStart(state.currentDate);
    const weekEnd = addDays(weekStart, 6);
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const fmtFull = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric' });
    const fmtDay = new Intl.DateTimeFormat('ja-JP', { day: 'numeric' });
    text = sameMonth
      ? `${fmtFull.format(weekStart)} – ${fmtDay.format(weekEnd)}`
      : `${fmtFull.format(weekStart)} – ${fmtFull.format(weekEnd)}`;
  }
  gsap.fromTo(label, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  label.textContent = text;
}

/* ============================================================
   8. Sidebar: today panel + legend
   ============================================================ */
function renderTodayPanel() {
  const d = state.selectedDate;
  $('#selDateWeekday').textContent = sameDay(d, today) ? '今日' : new Intl.DateTimeFormat('ja-JP', { weekday: 'long' }).format(d);
  $('#selDateDay').textContent = d.getDate();
  $('#selDateMonth').textContent = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);

  const events = visibleEventsForDate(isoDate(d));
  const list = $('#todayEventList');
  const empty = $('#todayEmpty');

  if (events.length === 0) {
    list.innerHTML = '';
    empty.classList.add('is-visible');
  } else {
    empty.classList.remove('is-visible');
    list.innerHTML = events.map((e) => `
      <div class="today-event" data-event-id="${e.id}">
        <span class="today-event__bar" style="--ec:${CATEGORY_COLOR[e.category]}"></span>
        <div class="today-event__body">
          <span class="today-event__time">${e.start} – ${e.end}</span>
          <p class="today-event__title">${e.title}</p>
          ${e.location ? `<p class="today-event__loc">${e.location}</p>` : ''}
        </div>
      </div>
    `).join('');
    gsap.fromTo('.today-event', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });

    $$('.today-event', list).forEach((row) => {
      row.addEventListener('click', () => {
        const ev = EVENTS.find((x) => x.id === row.getAttribute('data-event-id'));
        if (ev) showToast(`${ev.start}–${ev.end} 「${ev.title}」`);
      });
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openEventContextMenu(e.clientX, e.clientY, row.getAttribute('data-event-id'));
      });
    });
  }
}

function renderLegend() {
  const list = $('#legendList');
  list.innerHTML = Object.entries(CATEGORY_LABEL).map(([key, label]) => {
    const count = EVENTS.filter((e) => e.category === key).length;
    return `
      <label class="legend-item">
        <input type="checkbox" value="${key}" ${state.visibleCategories.has(key) ? 'checked' : ''} />
        <span class="legend-item__dot" style="--ec:${CATEGORY_COLOR[key]}"></span>
        <span class="legend-item__label">${label}</span>
        <span class="legend-item__count">${count}</span>
      </label>
    `;
  }).join('');

  $$('#legendList input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.visibleCategories.add(cb.value); else state.visibleCategories.delete(cb.value);
      renderAll('none');
    });
  });
}

function selectDate(date) {
  state.selectedDate = date;
  if (date.getMonth() !== state.currentDate.getMonth() || date.getFullYear() !== state.currentDate.getFullYear()) {
    state.currentDate = new Date(date);
  }
  renderAll('none');
}

/* ============================================================
   9. Event context menu
   ============================================================ */
let contextEventId = null;

function openEventContextMenu(x, y, eventId) {
  contextEventId = eventId;
  const menu = $('#eventContextMenu');
  const menuW = 170, menuH = 100;
  const posX = Math.min(x, window.innerWidth - menuW - 12);
  const posY = Math.min(y, window.innerHeight - menuH - 12);
  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;
  menu.classList.add('is-open');
  gsap.fromTo(menu, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' });
}

function initEventContextMenu() {
  const menu = $('#eventContextMenu');
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target)) closeEventContextMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEventContextMenu(); });

  $$('.context-menu__item', menu).forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const ev = EVENTS.find((x) => x.id === contextEventId);
      const name = ev ? ev.title : '予定';
      closeEventContextMenu();
      if (action === 'delete' && ev) {
        EVENTS = EVENTS.filter((x) => x.id !== ev.id);
        renderAll('none');
      }
      const messages = { edit: `「${name}」を編集します`, duplicate: `「${name}」を複製しました`, delete: `「${name}」を削除しました` };
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

function closeEventContextMenu() {
  const menu = $('#eventContextMenu');
  gsap.to(menu, { opacity: 0, scale: 0.96, duration: 0.14, onComplete: () => menu.classList.remove('is-open') });
}

/* ============================================================
   10. New event dialog
   ============================================================ */
function initEventDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const closeBtn = $('#dialogClose');
  const createBtn = $('#createEventBtn');
  const titleInput = $('#eventTitle');
  const dateInput = $('#eventDate');
  const startInput = $('#eventStart');
  const endInput = $('#eventEnd');
  const swatches = $$('.swatch', $('#categorySwatches'));
  let selectedCategory = 'work';

  function open() {
    dateInput.value = isoDate(state.selectedDate);
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
    gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => titleInput?.focus(), 100);
  }
  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });
  }

  $('#newEventBtn')?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      selectedCategory = sw.getAttribute('data-category');
    });
  });

  createBtn?.addEventListener('click', () => {
    if (!titleInput.value.trim() || !dateInput.value) {
      gsap.fromTo(dialog, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
      return;
    }
    createBtn.classList.add('is-loading');
    setTimeout(() => {
      createBtn.classList.remove('is-loading');
      EVENTS.push({
        id: `ev${eventSeq++}`,
        title: titleInput.value.trim(),
        date: dateInput.value,
        start: startInput.value || '09:00',
        end: endInput.value || '10:00',
        category: selectedCategory,
        location: '',
      });
      state.selectedDate = new Date(`${dateInput.value}T00:00:00`);
      state.currentDate = new Date(state.selectedDate);
      renderAll('none');
      titleInput.value = '';
      close();
      showToast('予定を作成しました');
    }, 900);
  });
}

/* ============================================================
   11. Command palette
   ============================================================ */
function initCommandPalette() {
  const overlay = $('#cmdkOverlay');
  const panel = $('#cmdk');
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const empty = $('#cmdkEmpty');
  const items = $$('.cmdk__item', list);

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.22, ease: 'power2.out' });
    gsap.fromTo(panel, { opacity: 0, scale: 0.96, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    gsap.to(panel, { opacity: 0, scale: 0.97, y: -6, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; input.value = ''; filter(''); } });
  }
  function filter(q) {
    q = q.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const match = item.textContent.toLowerCase().includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    empty.hidden = visible !== 0;
  }

  $('#cmdkTrigger')?.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('is-open') ? close() : open(); }
    else if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => filter(input.value));
  items.forEach((item) => item.addEventListener('click', () => {
    const msg = item.getAttribute('data-toast');
    close();
    if (msg) setTimeout(() => showToast(msg), 250);
  }));
}

/* ============================================================
   12. Render orchestration + load choreography
   ============================================================ */
function renderAll(direction) {
  renderPeriodLabel();
  if (state.view === 'month') {
    animateGridSwap('#monthGrid', direction, renderMonth);
  } else {
    animateGridSwap('#weekColumns', direction, renderWeek);
  }
  renderTodayPanel();
  renderLegend();
}

function animateGridSwap(selector, direction, renderFn) {
  const el = $(selector);
  if (!el || direction === 'none') { renderFn(); return; }
  const offset = direction === 'forward' ? -16 : 16;
  gsap.to(el, {
    opacity: 0, x: offset, duration: 0.18, ease: 'power2.in',
    onComplete: () => {
      renderFn();
      gsap.fromTo(el, { opacity: 0, x: -offset }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    }
  });
}

function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .fromTo('.cal-toolbar', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.28)
    .fromTo('.cal-main', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.4)
    .to('.cal-sidebar .panel', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.5);

  gsap.set('.cal-sidebar .panel', { y: 12 });
  tl.fromTo('.cal-sidebar .panel', { y: 12 }, { y: 0, duration: 0.5, stagger: 0.08 }, 0.5);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  buildEvents();
  initShellSidebar();
  initTopbarPopovers();
  initToolbar();
  initEventContextMenu();
  initEventDialog();
  initCommandPalette();

  renderAll('none');
  initLoadSequence();
});
