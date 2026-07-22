/* ============================================================
   Vantage — Task Detail
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const TEAM = [
  { i: 'AW', n: 'Aria Whitfield' },
  { i: 'MS', n: 'Mika Sato' },
  { i: 'TK', n: 'Tom Keller' },
  { i: 'JL', n: 'Julia Lang' },
  { i: 'RN', n: 'Ren Nakata' },
  { i: 'EC', n: 'Elena Cho' },
];

let CHECKLIST = [
  { id: 'i1', text: 'Stripe 連携モジュールの切り出し', done: true },
  { id: 'i2', text: 'リトライロジックの設計', done: true },
  { id: 'i3', text: 'エラーハンドリングのテスト', done: false },
  { id: 'i4', text: '既存テストカバレッジの確認', done: false },
  { id: 'i5', text: '段階的リリース計画の作成', done: false },
];
let checklistSeq = 6;

const COMMENTS = [
  { id: 'cm1', author: TEAM[2], time: '2日前', text: 'Stripe SDK のバージョンを最新にしてから着手します。既存のWebhook処理と競合しないか確認中です。' },
  { id: 'cm2', author: TEAM[0], time: '昨日', text: '良さそうです。QA環境でのリグレッションテストも忘れずにお願いします 🙏' },
];
let commentSeq = 3;

const HISTORY = [
  { who: TEAM[0], action: 'このタスクを作成しました', time: '7月3日', icon: 'create' },
  { who: TEAM[0], action: 'ステータスを Todo に設定しました', time: '7月3日', icon: 'status' },
  { who: TEAM[2], action: '担当者に割り当てられました', time: '7月8日', icon: 'assign' },
  { who: TEAM[2], action: 'ステータスを In Progress に変更しました', time: '2日前', icon: 'status' },
  { who: TEAM[0], action: 'コメントを追加しました', time: '昨日', icon: 'comment' },
];

const ICONS = {
  create: '<path d="M12 5v14M5 12h14"/>',
  status: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  assign: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
};

const FILE_TYPES = [
  { ext: 'fig', name: 'checkout-flow-v3.fig', size: '2.4 MB', icon: '<rect x="6" y="3" width="12" height="18" rx="6"/>' },
  { ext: 'pdf', name: 'payment-spec.pdf', size: '850 KB', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>' },
  { ext: 'png', name: 'error-state.png', size: '312 KB', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' },
];
let attachSeq = 0;

let currentAssignee = TEAM[2];
let currentStatus = { id: 'progress', label: 'In Progress', color: 'var(--amber)' };
let currentPriority = { id: 'urgent', label: 'Urgent', color: 'var(--red)' };
let selectedTags = new Set(['Engineering']);
let selectedDueDay = null;

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
   2. Sidebar
   ============================================================ */
function initSidebar() {
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

/* ============================================================
   3. Generic dropdown controller
   ============================================================ */
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
   4. Header actions
   ============================================================ */
function initHeaderActions() {
  $('#backLink')?.addEventListener('click', () => showToast('ボードに戻ります'));
  $('#copyLinkBtn')?.addEventListener('click', () => showToast('リンクをコピーしました'));

  createDropdown($('#taskMenuBtn'), $('#taskMenu'));
  $$('#taskMenu .dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      $('#taskMenu').classList.remove('is-open');
      if (action === 'delete') { openDeleteDialog(); return; }
      const messages = { duplicate: 'タスクを複製しました', archive: 'タスクをアーカイブしました' };
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

/* ============================================================
   5. Checklist
   ============================================================ */
function renderChecklist() {
  const list = $('#checklist');
  list.innerHTML = CHECKLIST.map((item) => `
    <li class="checklist-item ${item.done ? 'is-done' : ''}" data-id="${item.id}">
      <button class="checklist-item__box" data-toggle>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </button>
      <span class="checklist-item__text" contenteditable="true" spellcheck="false">${item.text}</span>
    </li>
  `).join('');
  updateChecklistProgress();
  bindChecklistEvents();
}

function updateChecklistProgress() {
  const done = CHECKLIST.filter((i) => i.done).length;
  const total = CHECKLIST.length;
  $('#checklistLabel').textContent = `${done} / ${total}`;
  const pct = total === 0 ? 0 : (done / total) * 100;
  gsap.to('#checklistFill', { width: `${pct}%`, duration: 0.6, ease: 'power3.out' });
}

function bindChecklistEvents() {
  $$('.checklist-item').forEach((el) => {
    const id = el.getAttribute('data-id');
    const box = $('[data-toggle]', el);
    box.addEventListener('click', () => {
      const item = CHECKLIST.find((i) => i.id === id);
      item.done = !item.done;
      el.classList.toggle('is-done', item.done);
      gsap.fromTo(box, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      updateChecklistProgress();
    });
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, { type: 'checklist', id });
    });
  });
}

function initChecklistAdd() {
  $('#checklistAddBtn')?.addEventListener('click', () => {
    const id = `i${checklistSeq++}`;
    CHECKLIST.push({ id, text: '新しい項目', done: false });
    renderChecklist();
    const newEl = $(`.checklist-item[data-id="${id}"]`);
    gsap.fromTo(newEl, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' });
    const textEl = $('.checklist-item__text', newEl);
    textEl.focus();
    document.getSelection().selectAllChildren(textEl);
  });
}

/* ============================================================
   6. Tabs
   ============================================================ */
function initTabs() {
  const tabs = $$('.tab');
  const pill = $('#tabPill');
  const panels = {
    comments: $('#panel-comments'),
    attachments: $('#panel-attachments'),
    history: $('#panel-history'),
  };

  function movePill(tab) {
    const parentRect = tab.parentElement.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    gsap.to(pill, { x: rect.left - parentRect.left - 3, width: rect.width, duration: 0.4, ease: 'power3.out' });
    tab.appendChild(pill);
  }

  function switchTo(key) {
    Object.entries(panels).forEach(([k, el]) => {
      if (k === key) {
        el.hidden = false;
        gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      } else {
        el.hidden = true;
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      movePill(tab);
      switchTo(tab.getAttribute('data-tab'));
    });
  });

  requestAnimationFrame(() => movePill($('.tab.is-active')));
  window.addEventListener('resize', () => movePill($('.tab.is-active')));
}

/* ============================================================
   7. Comments
   ============================================================ */
function renderComments() {
  const list = $('#commentList');
  list.innerHTML = COMMENTS.map((c) => `
    <div class="comment" data-id="${c.id}">
      <span class="avatar avatar--sm avatar--grad">${c.author.i}</span>
      <div class="comment__body">
        <div class="comment__head"><span class="comment__author">${c.author.n}</span><span class="comment__time">${c.time}</span></div>
        <p class="comment__text">${c.text}</p>
      </div>
    </div>
  `).join('');
  $$('.comment', list).forEach((el) => {
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, { type: 'comment', id: el.getAttribute('data-id') });
    });
  });
  updateCommentCount();
}

function updateCommentCount() {
  const tabCount = $('.tab[data-tab="comments"] .tab__count');
  if (tabCount) tabCount.textContent = COMMENTS.length;
}

function initCommentComposer() {
  const textarea = $('#commentInput');
  const sendBtn = $('#sendComment');

  function send() {
    const value = textarea.value.trim();
    if (!value) {
      gsap.fromTo(textarea.closest('.comment-composer__box'), { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
      return;
    }
    const id = `cm${commentSeq++}`;
    COMMENTS.push({ id, author: TEAM[0], time: 'たった今', text: value });
    renderComments();
    const newEl = $(`.comment[data-id="${id}"]`);
    gsap.fromTo(newEl, { opacity: 0, y: 14, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
    textarea.value = '';
    showToast('コメントを追加しました');
  }

  sendBtn?.addEventListener('click', send);
  textarea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
  });
  $('#attachInComposer')?.addEventListener('click', () => showToast('ファイル選択はこのデモでは無効です'));
}

/* ============================================================
   8. Attachments
   ============================================================ */
let ATTACHMENTS = [];

function renderAttachments() {
  const list = $('#attachmentList');
  const empty = $('#attachmentEmpty');
  const countEl = $('#attachCount');

  if (ATTACHMENTS.length === 0) {
    list.innerHTML = '';
    empty.classList.add('is-visible');
  } else {
    empty.classList.remove('is-visible');
    list.innerHTML = ATTACHMENTS.map((a) => `
      <div class="attachment-item" data-id="${a.id}">
        <span class="attachment-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${a.icon}</svg></span>
        <div class="attachment-item__body">
          <p class="attachment-item__name">${a.name}</p>
          <p class="attachment-item__meta">${a.size} · ${a.uploadedBy} が追加</p>
        </div>
        <button class="attachment-item__download" data-tooltip="ダウンロード">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
        </button>
      </div>
    `).join('');
    $$('.attachment-item__download', list).forEach((btn) => btn.addEventListener('click', () => showToast('ダウンロードを開始しました')));
  }
  countEl.textContent = ATTACHMENTS.length;
}

function initAttachmentAdd() {
  $('#addAttachmentBtn')?.addEventListener('click', () => {
    const file = FILE_TYPES[attachSeq % FILE_TYPES.length];
    attachSeq++;
    const id = `at${attachSeq}`;
    ATTACHMENTS.push({ id, name: file.name, size: file.size, icon: file.icon, uploadedBy: 'Aria W.' });
    renderAttachments();
    const newEl = $(`.attachment-item[data-id="${id}"]`);
    if (newEl) gsap.fromTo(newEl, { opacity: 0, y: 10, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
    showToast('ファイルを追加しました');
  });
}

/* ============================================================
   9. History
   ============================================================ */
function renderHistory() {
  const timeline = $('#historyTimeline');
  timeline.innerHTML = HISTORY.map((h) => `
    <div class="timeline-item">
      <span class="timeline-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[h.icon] || ICONS.create}</svg></span>
      <div class="timeline-item__body">
        <p><strong>${h.who.n}</strong> が${h.action}</p>
        <span class="timeline-item__time">${h.time}</span>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   10. Sidebar metadata: status / priority / assignee / due / tags
   ============================================================ */
function initStatusPicker() {
  createDropdown($('#statusTrigger'), $('#statusDropdown'));
  $$('.status-option[data-status]').forEach((opt) => {
    opt.addEventListener('click', () => {
      $$('.status-option[data-status]').forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      const label = opt.textContent.trim();
      const color = opt.style.getPropertyValue('--sc');
      $('#statusLabel').textContent = label;
      $('#statusTrigger').style.setProperty('--sc', color);
      $('#statusDropdown').classList.remove('is-open');
      showToast(`ステータスを ${label} に変更しました`);
    });
  });
}

function initPriorityPicker() {
  createDropdown($('#priorityTrigger'), $('#priorityDetailDropdown'));
  $$('#priorityDetailDropdown .status-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      $$('#priorityDetailDropdown .status-option').forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      const label = opt.textContent.trim();
      const color = opt.style.getPropertyValue('--sc');
      $('#priorityLabel').textContent = label;
      $('#priorityTrigger').style.setProperty('--sc', color);
      $('#priorityDetailDropdown').classList.remove('is-open');
      showToast(`優先度を ${label} に変更しました`);
    });
  });
}

function initAssigneePicker() {
  const list = $('#assigneeList');
  list.innerHTML = TEAM.map((m) => `
    <button class="member-row" data-initials="${m.i}">
      <span class="avatar avatar--xs avatar--grad">${m.i}</span>
      <span class="member-row__name">${m.n}</span>
    </button>
  `).join('');
  createDropdown($('#assigneeTrigger'), $('#assigneeDropdown'));
  $$('.member-row', list).forEach((row) => {
    row.addEventListener('click', () => {
      const initials = row.getAttribute('data-initials');
      const member = TEAM.find((m) => m.i === initials);
      $('#assigneeAvatar').textContent = member.i;
      $('#assigneeName').textContent = member.n;
      $('#assigneeDropdown').classList.remove('is-open');
      showToast(`担当者を ${member.n} に変更しました`);
    });
  });
}

function initTagEditor() {
  createDropdown($('#tagAddBtn'), $('#tagDropdown'));
  renderTags();
  $$('#tagCheckList input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) selectedTags.add(cb.value); else selectedTags.delete(cb.value);
      renderTags();
    });
  });
}

function renderTags() {
  const list = $('#tagList');
  list.innerHTML = Array.from(selectedTags).map((t) => `<span class="tag-chip">${t}</span>`).join('');
}

function initDuePicker() {
  createDropdown($('#dueTrigger'), $('#dueDropdown'));
  const grid = $('#calendarGrid');
  const monthLabel = $('#calMonthLabel');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  selectedDueDay = 24;

  const fmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  monthLabel.textContent = fmt.format(now);

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < startOffset; i++) html += `<div class="calendar__day is-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    html += `<div class="calendar__day ${d === selectedDueDay ? 'is-selected' : ''}" data-day="${d}">${d}</div>`;
  }
  grid.innerHTML = html;

  $$('.calendar__day[data-day]', grid).forEach((dayEl) => {
    dayEl.addEventListener('click', () => {
      $$('.calendar__day', grid).forEach((d) => d.classList.remove('is-selected'));
      dayEl.classList.add('is-selected');
      const day = dayEl.getAttribute('data-day');
      $('#dueLabel').textContent = `7月${day}日`;
      $('#dueDropdown').classList.remove('is-open');
      showToast(`期限を 7月${day}日 に設定しました`);
    });
  });
}

/* ============================================================
   11. Context menu (checklist items / comments)
   ============================================================ */
let contextTarget = null;

function openContextMenu(x, y, target) {
  contextTarget = target;
  const menu = $('#contextMenu');
  const menuW = 170, menuH = 90;
  const posX = Math.min(x, window.innerWidth - menuW - 12);
  const posY = Math.min(y, window.innerHeight - menuH - 12);
  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;
  menu.classList.add('is-open');
  gsap.fromTo(menu, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' });
}

function initContextMenu() {
  const menu = $('#contextMenu');
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target)) closeContextMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeContextMenu(); });

  $$('.context-menu__item', menu).forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      if (!contextTarget) return;

      if (action === 'delete') {
        if (contextTarget.type === 'checklist') {
          const el = $(`.checklist-item[data-id="${contextTarget.id}"]`);
          if (el) gsap.to(el, { opacity: 0, x: -14, height: 0, margin: 0, padding: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { el.remove(); CHECKLIST = CHECKLIST.filter((i) => i.id !== contextTarget.id); updateChecklistProgress(); } });
          showToast('項目を削除しました');
        } else if (contextTarget.type === 'comment') {
          const el = $(`.comment[data-id="${contextTarget.id}"]`);
          if (el) gsap.to(el, { opacity: 0, x: -14, height: 0, margin: 0, padding: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { el.remove(); const idx = COMMENTS.findIndex((c) => c.id === contextTarget.id); if (idx > -1) COMMENTS.splice(idx, 1); updateCommentCount(); } });
          showToast('コメントを削除しました');
        }
      } else if (action === 'edit') {
        if (contextTarget.type === 'checklist') {
          const textEl = $(`.checklist-item[data-id="${contextTarget.id}"] .checklist-item__text`);
          textEl?.focus();
        } else {
          showToast('コメントの編集モードにしました');
        }
      }
      closeContextMenu();
    });
  });
}

function closeContextMenu() {
  const menu = $('#contextMenu');
  gsap.to(menu, { opacity: 0, scale: 0.96, duration: 0.14, onComplete: () => menu.classList.remove('is-open') });
}

/* ============================================================
   12. Delete confirmation dialog
   ============================================================ */
function openDeleteDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  overlay.classList.add('is-open');
  gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
  gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  document.body.style.overflow = 'hidden';
}

function initDeleteDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const closeBtn = $('#dialogClose');
  const cancelBtn = $('#dialogCancel');
  const confirmBtn = $('#dialogConfirm');

  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });
  }

  closeBtn?.addEventListener('click', close);
  cancelBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  confirmBtn?.addEventListener('click', () => {
    confirmBtn.classList.add('is-loading');
    setTimeout(() => {
      confirmBtn.classList.remove('is-loading');
      close();
      showToast('タスクを削除しました');
    }, 1000);
  });
}

/* ============================================================
   13. Command palette
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
   14. Load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .fromTo('.detail-header', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.28)
    .to('.panel', { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.42)
    .to('.detail-sidebar', { opacity: 1, y: 0, duration: 0.55 }, 0.5);

  gsap.set(['.panel', '.detail-sidebar'], { y: 14 });
  tl.fromTo('.panel', { y: 14 }, { y: 0, duration: 0.55, stagger: 0.08 }, 0.42);
  tl.fromTo('.detail-sidebar', { y: 14 }, { y: 0, duration: 0.55 }, 0.5);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  initSidebar();
  initTopbarPopovers();
  initHeaderActions();

  renderChecklist();
  initChecklistAdd();

  initTabs();
  renderComments();
  initCommentComposer();
  renderAttachments();
  initAttachmentAdd();
  renderHistory();

  initStatusPicker();
  initPriorityPicker();
  initAssigneePicker();
  initTagEditor();
  initDuePicker();

  initContextMenu();
  initDeleteDialog();
  initCommandPalette();

  initLoadSequence();
});
