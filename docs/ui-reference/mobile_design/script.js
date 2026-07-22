/* ============================================================
   Vantage — Mobile
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const FOCUS_TASKS = [
  { id: 't1', title: 'ログイン画面のQA', time: '10:00', priority: 'high', done: false },
  { id: 't2', title: 'デザインレビューに参加', time: '13:30', priority: 'medium', done: false },
  { id: 't3', title: '週次レポートを送信', time: '17:00', priority: 'low', done: true },
  { id: 't4', title: '決済フロー PR をマージ', time: '18:00', priority: 'urgent', done: false },
];

const ACTIVITY = [
  { text: '<strong>Mika S.</strong> がコメントしました', time: '12分前', icon: 'comment' },
  { text: '<strong>Tom K.</strong> があなたを割り当てました', time: '1時間前', icon: 'assign' },
  { text: '「API 統合」を完了しました', time: '3時間前', icon: 'check' },
];

const ICONS = {
  comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  assign: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
};

const COLUMNS = [
  { id: 'backlog', name: 'Backlog', color: 'var(--text-tertiary)' },
  { id: 'todo', name: 'Todo', color: 'var(--blue)' },
  { id: 'progress', name: 'In Progress', color: 'var(--amber)' },
  { id: 'review', name: 'Review', color: 'var(--accent-1)' },
  { id: 'done', name: 'Done', color: 'var(--green)' },
];

const KANBAN_CARDS = {
  backlog: [
    { title: 'ダークモードのカラーパレット再設計', priority: 'low', tags: ['Design'], comments: 2, due: '来週' },
    { title: 'サードパーティ連携の調査', priority: 'low', tags: ['Engineering'], comments: 1, due: '未定' },
  ],
  todo: [
    { title: 'ログイン画面のQA', priority: 'high', tags: ['QA'], comments: 3, due: '明日' },
    { title: 'プッシュ通知の権限フロー', priority: 'medium', tags: ['Engineering'], comments: 1, due: '3日後' },
  ],
  progress: [
    { title: '決済フローのリファクタリング', priority: 'urgent', tags: ['Engineering'], comments: 6, due: '2日後' },
    { title: 'ダッシュボードのチャート', priority: 'high', tags: ['Design'], comments: 2, due: '4日後' },
  ],
  review: [
    { title: 'プロフィール設定画面のレビュー', priority: 'high', tags: ['Design'], comments: 5, due: '今日' },
  ],
  done: [
    { title: 'マーケサイトのSEO対応', priority: 'low', tags: ['Marketing'], comments: 2, due: '完了' },
    { title: 'API 統合テスト', priority: 'medium', tags: ['Engineering'], comments: 0, due: '完了' },
  ],
};

let CHECKLIST = [
  { id: 'c1', text: 'Stripe 連携モジュールの切り出し', done: true },
  { id: 'c2', text: 'リトライロジックの設計', done: true },
  { id: 'c3', text: 'エラーハンドリングのテスト', done: false },
  { id: 'c4', text: '既存テストカバレッジの確認', done: false },
  { id: 'c5', text: '段階的リリース計画の作成', done: false },
];

const COMMENTS = [
  { author: 'Tom K.', time: '2日前', text: 'Stripe SDK を最新にしてから着手します。' },
  { author: 'Aria W.', time: '昨日', text: 'QA環境でのリグレッションテストもお願いします。' },
];

const today = new Date();
today.setHours(0, 0, 0, 0);
function isoDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const EVENTS = [
  { offset: 0, start: '09:00', title: 'チームスタンドアップ', color: 'var(--blue)' },
  { offset: 0, start: '10:00', title: 'デザインレビュー', color: 'var(--accent-1)' },
  { offset: 0, start: '18:00', title: '決済フロー PR 締切', color: 'var(--red)' },
  { offset: 1, start: '14:00', title: '1on1 with Tom', color: 'var(--accent-1)' },
  { offset: 3, start: '16:00', title: '歯医者', color: 'var(--green)' },
  { offset: 5, start: '17:00', title: 'Q3ロードマップ締切', color: 'var(--red)' },
].map((e) => ({ ...e, date: isoDate(addDays(today, e.offset)) }));

/* ============================================================
   1. Toasts
   ============================================================ */
function showToast(message) {
  const host = $('#toastHost');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast-m';
  toast.innerHTML = `<svg class="toast-m__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${message}</span>`;
  host.appendChild(toast);
  gsap.fromTo(toast, { y: -14, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  setTimeout(() => {
    gsap.to(toast, { y: -10, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => toast.remove() });
  }, 2400);
}

/* ============================================================
   2. Status bar clock
   ============================================================ */
function initClock() {
  const el = $('#statusTime');
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  }
  update();
  setInterval(update, 30000);
}

/* ============================================================
   3. Bottom tab bar + page switching
   ============================================================ */
let currentTab = 'overview';

function initTabBar() {
  const tabs = $$('.m-tab');
  const pill = $('#tabPillM');
  const pages = $$('.m-page');

  function movePill(tab) {
    const barRect = $('#mTabbar').getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    gsap.to(pill, { x: rect.left - barRect.left, width: rect.width, duration: 0.35, ease: 'power3.out' });
  }

  function switchTab(key, tab) {
    if (key === currentTab) return;
    currentTab = key;
    tabs.forEach((t) => t.classList.toggle('is-active', t.getAttribute('data-tab') === key));
    if (tab) movePill(tab);

    pages.forEach((p) => {
      if (p.getAttribute('data-page') === key) {
        p.hidden = false;
        p.classList.add('is-active');
        gsap.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
      } else {
        p.classList.remove('is-active');
        p.hidden = true;
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      gsap.fromTo(tab.querySelector('svg'), { scale: 0.8 }, { scale: 1.05, duration: 0.25, ease: 'back.out(3)' });
      switchTab(tab.getAttribute('data-tab'), tab);
    });
  });

  $$('[data-goto-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-goto-tab');
      const tab = $(`.m-tab[data-tab="${key}"]`);
      switchTab(key, tab);
    });
  });

  requestAnimationFrame(() => movePill($('.m-tab.is-active')));
  window.addEventListener('resize', () => movePill($(`.m-tab[data-tab="${currentTab}"]`)));

  $$('[data-toast]').forEach((el) => {
    if (el.closest('.m-sheet') || el.closest('.m-subpage')) return;
    el.addEventListener('click', () => showToast(el.getAttribute('data-toast')));
  });
}

/* ============================================================
   4. Overview: date header, counters, focus list, activity
   ============================================================ */
function initOverviewDate() {
  const el = $('#overviewDate');
  el.textContent = new Intl.DateTimeFormat('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
}

function animateCounters() {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { val: 0 };
    gsap.to(obj, { val: target, duration: 1.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; } });
  });
}

function renderFocusTasks() {
  const list = $('#focusTaskList');
  list.innerHTML = FOCUS_TASKS.map((t) => `
    <div class="m-task-item ${t.done ? 'is-done' : ''}" data-id="${t.id}">
      <button class="m-task-item__check" data-check>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </button>
      <div class="m-task-item__body">
        <p class="m-task-item__title">${t.title}</p>
        <div class="m-task-item__meta">
          <span class="m-task-item__prio priority-dot-m priority-dot-m--${t.priority}"></span>
          <span class="m-task-item__time">${t.time}</span>
        </div>
      </div>
      <svg class="m-task-item__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </div>
  `).join('');

  $$('.m-task-item', list).forEach((item) => {
    const id = item.getAttribute('data-id');
    $('[data-check]', item).addEventListener('click', (e) => {
      e.stopPropagation();
      const task = FOCUS_TASKS.find((t) => t.id === id);
      task.done = !task.done;
      item.classList.toggle('is-done', task.done);
      gsap.fromTo($('[data-check]', item), { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    });
    item.addEventListener('click', () => openTaskSheet());
  });
}

function renderActivity() {
  const list = $('#activityList');
  list.innerHTML = ACTIVITY.map((a) => `
    <div class="m-activity-row">
      <span class="m-activity-row__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon]}</svg></span>
      <div>
        <p class="m-activity-row__text">${a.text}</p>
        <p class="m-activity-row__time">${a.time}</p>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   5. Pull to refresh (Overview)
   ============================================================ */
function initPullToRefresh() {
  const scroller = $('#overviewScroll');
  const indicator = $('#pullIndicator');
  let startY = 0, pulling = false, dragging = false;

  scroller.addEventListener('touchstart', (e) => {
    if (scroller.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });

  scroller.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0 && scroller.scrollTop <= 0) {
      dragging = true;
      const height = Math.min(delta * 0.5, 70);
      gsap.set(indicator, { height, opacity: Math.min(height / 50, 1) });
    }
  }, { passive: true });

  scroller.addEventListener('touchend', () => {
    if (!dragging) { pulling = false; return; }
    const height = parseFloat(gsap.getProperty(indicator, 'height'));
    if (height > 45) {
      gsap.to(indicator, { height: 50, opacity: 1, duration: 0.2 });
      setTimeout(() => {
        gsap.to(indicator, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
        showToast('最新の状態に更新しました');
      }, 700);
    } else {
      gsap.to(indicator, { height: 0, opacity: 0, duration: 0.25 });
    }
    pulling = false; dragging = false;
  });
}

/* ============================================================
   6. Board: column tabs + swipeable pager
   ============================================================ */
let boardIndex = 0;

function renderBoard() {
  const tabsEl = $('#columnTabs');
  const trackEl = $('#boardTrack');
  const dotsEl = $('#boardDots');

  tabsEl.innerHTML = COLUMNS.map((c, i) => `
    <button class="m-column-tab ${i === 0 ? 'is-active' : ''}" data-index="${i}">
      <span class="m-column-tab__dot" style="background:${c.color}"></span>${c.name}
      <span style="color:var(--text-tertiary)">${KANBAN_CARDS[c.id].length}</span>
    </button>
  `).join('');

  trackEl.innerHTML = COLUMNS.map((c) => `
    <div class="m-board-column" data-column="${c.id}">
      ${KANBAN_CARDS[c.id].map((card) => `
        <div class="m-kanban-card" data-card>
          <div class="m-kanban-card__top">
            <span class="m-kanban-card__prio"><span class="priority-dot-m priority-dot-m--${card.priority}"></span>${card.priority}</span>
          </div>
          <p class="m-kanban-card__title">${card.title}</p>
          <div class="m-kanban-card__tags">${card.tags.map((t) => `<span class="m-tag">${t}</span>`).join('')}</div>
          <div class="m-kanban-card__footer">
            <div class="m-kanban-card__meta">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${card.due}</span>
              ${card.comments > 0 ? `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>${card.comments}</span>` : ''}
            </div>
            <span class="avatar avatar--xs avatar--grad">AW</span>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  dotsEl.innerHTML = COLUMNS.map((_, i) => `<span class="m-page-dots__dot ${i === 0 ? 'is-active' : ''}"></span>`).join('');

  $$('[data-card]', trackEl).forEach((card) => card.addEventListener('click', () => openTaskSheet()));
  $$('.m-column-tab', tabsEl).forEach((tab) => {
    tab.addEventListener('click', () => goToColumn(parseInt(tab.getAttribute('data-index'), 10)));
  });

  initBoardSwipe();
}

function goToColumn(index) {
  boardIndex = Math.max(0, Math.min(COLUMNS.length - 1, index));
  const track = $('#boardTrack');
  const pager = $('#boardPager');
  gsap.to(track, { x: -boardIndex * pager.clientWidth, duration: 0.4, ease: 'power3.out' });
  $$('.m-column-tab').forEach((t, i) => t.classList.toggle('is-active', i === boardIndex));
  $$('.m-page-dots__dot', $('#boardDots')).forEach((d, i) => d.classList.toggle('is-active', i === boardIndex));
}

function initBoardSwipe() {
  const pager = $('#boardPager');
  const track = $('#boardTrack');
  let startX = 0, currentX = 0, dragging = false, baseX = 0;

  pager.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    baseX = -boardIndex * pager.clientWidth;
    dragging = true;
  }, { passive: true });

  pager.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    gsap.set(track, { x: baseX + currentX });
  }, { passive: true });

  pager.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const threshold = pager.clientWidth * 0.22;
    if (currentX < -threshold && boardIndex < COLUMNS.length - 1) boardIndex++;
    else if (currentX > threshold && boardIndex > 0) boardIndex--;
    currentX = 0;
    goToColumn(boardIndex);
  });

  window.addEventListener('resize', () => goToColumn(boardIndex));
}

/* ============================================================
   7. Calendar (mobile)
   ============================================================ */
let calDate = new Date(today);
let selectedDate = new Date(today);

function renderCalendar() {
  const grid = $('#calGrid');
  const monthLabel = $('#calMonthLabel');
  const year = calDate.getFullYear();
  const month = calDate.getMonth();

  monthLabel.textContent = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' }).format(calDate);

  const firstOfMonth = new Date(year, month, 1);
  let startOffset = firstOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const gridStart = addDays(firstOfMonth, -startOffset);

  let html = '';
  for (let i = 0; i < 42; i++) {
    const cellDate = addDays(gridStart, i);
    if (cellDate.getMonth() !== month && i >= 35) continue;
    const iso = isoDate(cellDate);
    const isOutside = cellDate.getMonth() !== month;
    const isToday = isoDate(cellDate) === isoDate(today);
    const isSelected = isoDate(cellDate) === isoDate(selectedDate);
    const hasEvents = EVENTS.some((e) => e.date === iso);
    html += `<div class="m-cal-day ${isOutside ? 'is-outside' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date="${iso}">${cellDate.getDate()}${hasEvents ? '<span class="m-cal-day__dot"></span>' : ''}</div>`;
  }
  grid.innerHTML = html;

  $$('.m-cal-day', grid).forEach((el) => {
    el.addEventListener('click', () => {
      selectedDate = new Date(`${el.getAttribute('data-date')}T00:00:00`);
      renderCalendar();
      renderAgenda();
    });
  });
}

function renderAgenda() {
  const list = $('#agendaList');
  const empty = $('#agendaEmpty');
  const label = $('#agendaDateLabel');
  const iso = isoDate(selectedDate);
  const isToday = iso === isoDate(today);

  label.textContent = isToday ? '今日の予定' : new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(selectedDate);

  const events = EVENTS.filter((e) => e.date === iso).sort((a, b) => a.start.localeCompare(b.start));
  if (events.length === 0) {
    list.innerHTML = '';
    empty.classList.add('is-visible');
  } else {
    empty.classList.remove('is-visible');
    list.innerHTML = events.map((e) => `
      <div class="m-agenda-item">
        <span class="m-agenda-item__bar" style="--ec:${e.color}"></span>
        <span class="m-agenda-item__time">${e.start}</span>
        <span class="m-agenda-item__title">${e.title}</span>
      </div>
    `).join('');
    gsap.fromTo('.m-agenda-item', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
  }
}

function initCalendarNav() {
  $('#calPrevBtn').addEventListener('click', () => { calDate = new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1); animateCalSwipe(1); });
  $('#calNextBtn').addEventListener('click', () => { calDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1); animateCalSwipe(-1); });
  $('#todayBtnM').addEventListener('click', () => {
    calDate = new Date(today); selectedDate = new Date(today);
    renderCalendar(); renderAgenda();
    showToast('今日に移動しました');
  });

  const swipeArea = $('#calSwipeArea');
  let startX = 0;
  swipeArea.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  swipeArea.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - startX;
    if (delta < -50) { calDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1); animateCalSwipe(-1); }
    else if (delta > 50) { calDate = new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1); animateCalSwipe(1); }
  });
}

function animateCalSwipe(direction) {
  const grid = $('#calGrid');
  gsap.to(grid, {
    opacity: 0, x: direction * -16, duration: 0.16, ease: 'power2.in',
    onComplete: () => {
      renderCalendar();
      gsap.fromTo(grid, { opacity: 0, x: direction * 16 }, { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' });
    }
  });
}

/* ============================================================
   8. Task Detail sheet
   ============================================================ */
function renderSheetChecklist() {
  const list = $('#sheetChecklist');
  list.innerHTML = CHECKLIST.map((item) => `
    <div class="m-checklist-item ${item.done ? 'is-done' : ''}" data-id="${item.id}">
      <button class="m-checklist-item__box"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></button>
      <span class="m-checklist-item__text">${item.text}</span>
    </div>
  `).join('');
  updateSheetChecklistProgress();

  $$('.m-checklist-item', list).forEach((el) => {
    const id = el.getAttribute('data-id');
    $('.m-checklist-item__box', el).addEventListener('click', () => {
      const item = CHECKLIST.find((i) => i.id === id);
      item.done = !item.done;
      el.classList.toggle('is-done', item.done);
      gsap.fromTo($('.m-checklist-item__box', el), { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      updateSheetChecklistProgress();
    });
  });
}

function updateSheetChecklistProgress() {
  const done = CHECKLIST.filter((i) => i.done).length;
  const total = CHECKLIST.length;
  $('#sheetChecklistCount').textContent = `${done}/${total}`;
  gsap.to('#sheetChecklistFill', { width: `${(done / total) * 100}%`, duration: 0.5, ease: 'power3.out' });
}

function renderSheetComments() {
  const list = $('#sheetComments');
  list.innerHTML = COMMENTS.map((c) => `
    <div class="m-comment">
      <span class="avatar avatar--sm avatar--grad">${c.author.slice(0, 2).toUpperCase()}</span>
      <div class="m-comment__body">
        <div class="m-comment__head"><span class="m-comment__author">${c.author}</span><span class="m-comment__time">${c.time}</span></div>
        <p class="m-comment__text">${c.text}</p>
      </div>
    </div>
  `).join('');
}

function initSheetComposer() {
  const input = $('#sheetCommentInput');
  const sendBtn = $('#sheetSendComment');
  function send() {
    const val = input.value.trim();
    if (!val) return;
    COMMENTS.push({ author: 'Aria W.', time: 'たった今', text: val });
    renderSheetComments();
    const newEl = $('#sheetComments').lastElementChild;
    gsap.fromTo(newEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    input.value = '';
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
}

function openTaskSheet() {
  openSheet($('#taskSheetOverlay'), $('#taskSheet'), 'full');
}

/* ============================================================
   9. New Task sheet
   ============================================================ */
function initNewTaskSheet() {
  const priorityBtns = $$('.priority-chip-m', $('#newTaskPriority'));
  let selectedPriority = 'low';
  priorityBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedPriority = btn.getAttribute('data-priority');
    });
  });

  $('#fabBtn').addEventListener('click', () => {
    gsap.fromTo('#fabBtn', { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    openSheet($('#newTaskOverlay'), $('#newTaskSheetEl'), 'partial');
  });

  $('#createTaskBtnM').addEventListener('click', () => {
    const input = $('#newTaskInput');
    if (!input.value.trim()) return;
    closeSheet($('#newTaskOverlay'), $('#newTaskSheetEl'), 'partial');
    setTimeout(() => showToast('タスクを作成しました'), 300);
    input.value = '';
    priorityBtns.forEach((b) => b.classList.remove('is-active'));
    priorityBtns[0].classList.add('is-active');
  });
}

/* ============================================================
   10. Generic sheet open/close + drag-to-dismiss
   ============================================================ */
function openSheet(overlay, sheet, kind) {
  overlay.classList.add('is-open');
  gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
  gsap.fromTo(sheet, { y: '100%' }, { y: '0%', duration: 0.45, ease: 'power3.out' });
}

function closeSheet(overlay, sheet) {
  gsap.to(sheet, { y: '100%', duration: 0.32, ease: 'power2.in' });
  gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => overlay.classList.remove('is-open') });
}

function initSheetDismiss() {
  const pairs = [
    { overlay: $('#taskSheetOverlay'), sheet: $('#taskSheet'), handle: $('#taskSheetHandle'), closeBtn: $('#taskSheetClose') },
    { overlay: $('#newTaskOverlay'), sheet: $('#newTaskSheetEl'), handle: $('.m-sheet__handle', $('#newTaskSheetEl')) },
  ];

  pairs.forEach(({ overlay, sheet, handle, closeBtn }) => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(overlay, sheet); });
    closeBtn?.addEventListener('click', () => closeSheet(overlay, sheet));

    let startY = 0, dragging = false;
    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; dragging = true; }, { passive: true });
    handle.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const delta = Math.max(0, e.touches[0].clientY - startY);
      gsap.set(sheet, { y: delta });
    }, { passive: true });
    handle.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 90) closeSheet(overlay, sheet);
      else gsap.to(sheet, { y: 0, duration: 0.3, ease: 'power3.out' });
    });
  });
}

/* ============================================================
   11. Me tab: subpage push/pop navigation
   ============================================================ */
function initMeNavigation() {
  $$('[data-push]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-push');
      const subpage = $(`.m-subpage[data-subpage="${key}"]`);
      subpage.classList.add('is-open');
      gsap.fromTo(subpage, { x: '100%' }, { x: '0%', duration: 0.38, ease: 'power3.out' });
    });
  });

  $$('.m-subpage [data-pop]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subpage = btn.closest('.m-subpage');
      gsap.to(subpage, { x: '100%', duration: 0.32, ease: 'power2.in', onComplete: () => subpage.classList.remove('is-open') });
    });
  });

  // Edge-swipe back gesture
  $$('.m-subpage').forEach((subpage) => {
    let startX = 0, dragging = false;
    subpage.addEventListener('touchstart', (e) => {
      if (e.touches[0].clientX < 30) { startX = e.touches[0].clientX; dragging = true; }
    }, { passive: true });
    subpage.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const delta = Math.max(0, e.touches[0].clientX - startX);
      gsap.set(subpage, { x: delta });
    }, { passive: true });
    subpage.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const delta = e.changedTouches[0].clientX - startX;
      if (delta > 80) gsap.to(subpage, { x: '100%', duration: 0.3, ease: 'power2.in', onComplete: () => subpage.classList.remove('is-open') });
      else gsap.to(subpage, { x: 0, duration: 0.3, ease: 'power3.out' });
    });
  });
}

function initMeToggles() {
  $$('.toggle-switch-m').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-on');
      gsap.fromTo(toggle, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
    });
  });
  $$('#accentSwatchesM .swatch-m').forEach((sw) => {
    sw.addEventListener('click', () => {
      $$('#accentSwatchesM .swatch-m').forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      showToast('アクセントカラーを変更しました');
    });
  });
}

/* ============================================================
   12. Load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo('.device-frame', { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 0)
    .fromTo('.m-page-head', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 0.3)
    .fromTo('.m-stat-card', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, 0.4)
    .fromTo('.m-tabbar', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, 0.45)
    .fromTo('.m-quick-actions', { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.5)
    .fromTo('.m-section', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.55);

  setTimeout(animateCounters, 700);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initTabBar();
  initOverviewDate();
  renderFocusTasks();
  renderActivity();
  initPullToRefresh();

  renderBoard();

  renderCalendar();
  renderAgenda();
  initCalendarNav();

  renderSheetChecklist();
  renderSheetComments();
  initSheetComposer();
  initNewTaskSheet();
  initSheetDismiss();

  initMeNavigation();
  initMeToggles();

  initLoadSequence();
});
