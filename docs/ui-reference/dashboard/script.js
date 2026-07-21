/* ============================================================
   Vantage — Dashboard
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const WEEK_DATA = [
  { label: '月', value: 6, max: 10 },
  { label: '火', value: 9, max: 10 },
  { label: '水', value: 4, max: 10 },
  { label: '木', value: 8, max: 10 },
  { label: '金', value: 10, max: 10 },
  { label: '土', value: 3, max: 10 },
  { label: '日', value: 5, max: 10 },
];

const PROJECTS = [
  { icon: '🪐', color: 'rgba(154,133,255,0.16)', name: 'ブランドリニューアル', progress: 72, due: '3日後', soon: true, members: ['AW', 'MS', 'TK'] },
  { icon: '🧭', color: 'rgba(85,209,155,0.16)', name: 'モバイルアプリ v2', progress: 45, due: '来週', soon: false, members: ['JL', 'RN'] },
  { icon: '📊', color: 'rgba(242,178,92,0.16)', name: 'Q3 マーケティング計画', progress: 88, due: '明日', soon: true, members: ['AW', 'JL', 'MS', 'TK'] },
  { icon: '🛠️', color: 'rgba(255,107,107,0.14)', name: 'API 基盤移行', progress: 30, due: '2週間後', soon: false, members: ['TK', 'RN'] },
  { icon: '🎨', color: 'rgba(154,133,255,0.16)', name: 'デザインシステム統一', progress: 60, due: '5日後', soon: false, members: ['MS', 'AW'] },
];

const TEAM = [
  { initials: 'AW', name: 'Aria Whitfield', role: 'Product Lead', status: 'online' },
  { initials: 'MS', name: 'Mika Sato', role: 'Designer', status: 'online' },
  { initials: 'TK', name: 'Tom Keller', role: 'Engineer', status: 'away' },
  { initials: 'JL', name: 'Julia Lang', role: 'Engineer', status: 'online' },
  { initials: 'RN', name: 'Ren Nakata', role: 'QA', status: 'offline' },
  { initials: 'SB', name: 'Sam Brooks', role: 'Marketing', status: 'away' },
  { initials: 'EC', name: 'Elena Cho', role: 'Engineer', status: 'online' },
  { initials: 'DP', name: 'Dev Patel', role: 'PM', status: 'offline' },
];

const ACTIVITY = [
  { who: 'Mika S.', action: '「Design Review」にコメントしました', time: '6分前', icon: 'comment' },
  { who: 'Tom K.', action: 'あなたを「API 基盤移行」に割り当てました', time: '42分前', icon: 'assign' },
  { who: 'Julia L.', action: '「API 統合」タスクを完了しました', time: '2時間前', icon: 'check' },
  { who: 'Ren N.', action: 'あなたを「モバイルアプリ v2」に招待しました', time: '昨日', icon: 'invite' },
  { who: 'Aria W.', action: '「Q3 マーケティング計画」を作成しました', time: '2日前', icon: 'create' },
];

const ICONS = {
  comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  assign: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  invite: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  create: '<path d="M12 5v14M5 12h14"/>',
};

/* ============================================================
   1. Clock / date header
   ============================================================ */
function initDateHeader() {
  const el = $('#todayDate');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' });
  el.textContent = fmt.format(new Date());
}

/* ============================================================
   2. Toasts
   ============================================================ */
function showToast(message) {
  const host = $('#toastHost');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    <span>${message}</span>
  `;
  host.appendChild(toast);
  gsap.fromTo(toast, { y: -16, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
  setTimeout(() => {
    gsap.to(toast, { y: -12, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => toast.remove() });
  }, 3000);
}

/* ============================================================
   3. Sidebar collapse (desktop) + mobile drawer
   ============================================================ */
function initSidebar() {
  const sidebar = $('#sidebar');
  const toggle = $('#sidebarToggle');
  const mobileToggle = $('#mobileSidebarToggle');

  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('is-collapsed');
  });

  mobileToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('is-mobile-open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    if (!sidebar.classList.contains('is-mobile-open')) return;
    if (sidebar.contains(e.target) || e.target.closest('#mobileSidebarToggle')) return;
    sidebar.classList.remove('is-mobile-open');
  });
}

/* ============================================================
   4. Generic dropdown/popover controller
   ============================================================ */
function initDropdown({ trigger, panel, onOpen } = {}) {
  if (!trigger || !panel) return;

  function open() {
    closeAllDropdowns();
    panel.classList.add('is-open');
    gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out' });
    onOpen?.();
  }
  function close() {
    gsap.to(panel, {
      opacity: 0, y: -6, scale: 0.98, duration: 0.18, ease: 'power2.in',
      onComplete: () => panel.classList.remove('is-open')
    });
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close };
}

function closeAllDropdowns() {
  $$('.dropdown.is-open').forEach((panel) => {
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.15, onComplete: () => panel.classList.remove('is-open') });
  });
}

function initTopbarPopovers() {
  initDropdown({ trigger: $('#notifBtn'), panel: $('#notifDropdown') });
  initDropdown({ trigger: $('#profileBtn'), panel: $('#profileDropdown') });

  $('#clearNotifs')?.addEventListener('click', () => {
    $('#notifList').style.display = 'none';
    $('#notifEmpty').classList.add('is-visible');
    $('#notifBadge').style.display = 'none';
    showToast('すべての通知を既読にしました');
  });
}

/* ============================================================
   5. Command palette
   ============================================================ */
function initCommandPalette() {
  const overlay = $('#cmdkOverlay');
  const panel = $('#cmdk');
  const input = $('#cmdkInput');
  const list = $('#cmdkList');
  const empty = $('#cmdkEmpty');
  const items = $$('.cmdk__item', list);
  const groupLabels = $$('.cmdk__group-label', list);

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.22, ease: 'power2.out' });
    gsap.fromTo(panel, { opacity: 0, scale: 0.96, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    gsap.to(panel, { opacity: 0, scale: 0.97, y: -6, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        input.value = '';
        filterItems('');
      }
    });
  }

  function filterItems(query) {
    const q = query.trim().toLowerCase();
    let visibleCount = 0;
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const match = text.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    groupLabels.forEach((label) => {
      let el = label.nextElementSibling;
      let hasVisible = false;
      while (el && !el.classList.contains('cmdk__group-label')) {
        if (el.classList.contains('cmdk__item') && el.style.display !== 'none') hasVisible = true;
        el = el.nextElementSibling;
      }
      label.style.display = hasVisible ? '' : 'none';
    });
    empty.hidden = visibleCount !== 0;
  }

  $('#cmdkTrigger')?.addEventListener('click', open);
  $('#qaCmdk')?.addEventListener('click', open);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('is-open') ? close() : open();
    } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      close();
    }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => filterItems(input.value));

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const msg = item.getAttribute('data-toast');
      close();
      if (msg) setTimeout(() => showToast(msg), 250);
    });
  });
}

/* ============================================================
   6. New Project dialog
   ============================================================ */
function initDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const closeBtn = $('#dialogClose');
  const createBtn = $('#createProjectBtn');
  const nameInput = $('#projectName');
  const openers = [$('#newProjectBtn'), $('#qaNewProject')];

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
    gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInput?.focus(), 100);
  }
  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0, duration: 0.24, ease: 'power2.in',
      onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }
    });
  }

  openers.forEach((btn) => btn?.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  createBtn?.addEventListener('click', () => {
    if (!nameInput.value.trim()) {
      gsap.fromTo(dialog, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
      return;
    }
    createBtn.classList.add('is-loading');
    setTimeout(() => {
      createBtn.classList.remove('is-loading');
      nameInput.value = '';
      close();
      showToast('プロジェクトを作成しました');
    }, 1100);
  });
}

/* ============================================================
   7. Quick actions + misc dummy buttons
   ============================================================ */
function initQuickActions() {
  $('#qaNewTask')?.addEventListener('click', () => showToast('新規タスクを作成しました'));
  $('#newTaskBtn')?.addEventListener('click', () => showToast('新規タスクを作成しました'));
  $('#qaInvite')?.addEventListener('click', () => showToast('招待リンクをコピーしました'));
  $('#inviteBtn')?.addEventListener('click', () => showToast('招待リンクをコピーしました'));
  $('#viewAllProjects')?.addEventListener('click', () => showToast('すべてのプロジェクトを表示します'));
}

/* ============================================================
   8. Populate: projects / team / activity / calendar / chart
   ============================================================ */
function renderProjects() {
  const list = $('#projectList');
  if (!list) return;
  list.innerHTML = PROJECTS.map((p, i) => `
    <div class="project-row" data-index="${i}">
      <span class="project-row__icon" style="background:${p.color}">${p.icon}</span>
      <div class="project-row__body">
        <p class="project-row__name">${p.name}</p>
        <div class="project-row__meta">
          <div class="project-row__bar"><div class="project-row__bar-fill" data-target="${p.progress}"></div></div>
          <span class="project-row__pct">${p.progress}%</span>
        </div>
      </div>
      <div class="project-row__avatars">
        ${p.members.map((m) => `<span class="avatar avatar--xs">${m}</span>`).join('')}
      </div>
      <span class="project-row__due ${p.soon ? 'project-row__due--soon' : ''}">${p.due}</span>
    </div>
  `).join('');
}

function renderTeam() {
  const grid = $('#teamGrid');
  if (!grid) return;
  grid.innerHTML = TEAM.map((m) => `
    <div class="team-member">
      <span class="team-member__avatar-wrap">
        <span class="avatar avatar--sm avatar--grad">${m.initials}</span>
        <span class="status-dot status-dot--${m.status}"></span>
      </span>
      <span>
        <span class="team-member__name" style="display:block">${m.name}</span>
        <span class="team-member__role">${m.role}</span>
      </span>
    </div>
  `).join('');
}

function renderActivity() {
  const timeline = $('#timeline');
  if (!timeline) return;
  timeline.innerHTML = ACTIVITY.map((a) => `
    <div class="timeline-item">
      <span class="timeline-item__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon] || ICONS.create}</svg>
      </span>
      <div class="timeline-item__body">
        <p><strong>${a.who}</strong> が${a.action}</p>
        <span class="timeline-item__time">${a.time}</span>
      </div>
    </div>
  `).join('');
}

function renderCalendar() {
  const grid = $('#calendarGrid');
  const monthLabel = $('#calMonthLabel');
  if (!grid) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const fmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  if (monthLabel) monthLabel.textContent = fmt.format(now);

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const taskDays = new Set([3, 7, 12, today, today + 2, 21, 27].filter((d) => d > 0 && d <= daysInMonth));

  let html = '';
  for (let i = 0; i < startOffset; i++) html += `<div class="calendar__day is-empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    const hasTask = taskDays.has(d);
    html += `<div class="calendar__day ${isToday ? 'is-today' : ''}" ${hasTask ? `data-tooltip="タスク ${1 + (d % 3)} 件"` : ''}>
      ${d}${hasTask ? '<span class="calendar__dot"></span>' : ''}
    </div>`;
  }
  grid.innerHTML = html;
}

function renderChart() {
  const bars = $('#chartBars');
  if (!bars) return;
  bars.innerHTML = WEEK_DATA.map((d) => `
    <div class="chart__bar-wrap">
      <div class="chart__bar" data-target="${(d.value / d.max) * 100}" data-value="${d.value}"></div>
    </div>
  `).join('');
}

/* ============================================================
   9. Counter + ring + bar + progress animations
   ============================================================ */
function animateCounters() {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
    });
  });
}

function animateRings() {
  $$('.ring').forEach((ring) => {
    const pct = parseFloat(ring.getAttribute('data-ring')) || 0;
    const circle = $('.ring__value', ring);
    if (!circle) return;
    const circumference = 100.53;
    const offset = circumference - (pct / 100) * circumference;
    gsap.to(circle, { strokeDashoffset: offset, duration: 1.4, ease: 'power2.out' });
  });
}

function animateChartBars() {
  gsap.utils.toArray('.chart__bar').forEach((bar, i) => {
    const target = bar.getAttribute('data-target');
    gsap.to(bar, { height: `${target}%`, duration: 0.9, delay: 0.05 * i, ease: 'power3.out' });
  });
}

function animateProjectBars() {
  gsap.utils.toArray('.project-row__bar-fill').forEach((fill, i) => {
    const target = fill.getAttribute('data-target');
    gsap.to(fill, { width: `${target}%`, duration: 1, delay: 0.06 * i, ease: 'power3.out' });
  });
}

/* ============================================================
   10. Skeleton → content reveal
   ============================================================ */
function resolveSkeletons() {
  const cards = $$('.stat-card.is-loading');
  setTimeout(() => {
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.remove('is-loading');
        gsap.fromTo(card.querySelector('.stat-card__real'),
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }, i * 90);
    });
    setTimeout(() => { animateCounters(); animateRings(); }, cards.length * 90 + 150);
  }, 650);
}

/* ============================================================
   11. Load choreography + scroll reveal
   ============================================================ */
function initLoadSequence() {
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .fromTo('.page-head', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.28)
    .to('.stat-card', { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.4);

  gsap.set('.stat-card', { y: 14 });
  tl.fromTo('.stat-card', { y: 14 }, { y: 0, duration: 0.55, stagger: 0.08 }, 0.4);

  // Cards below the fold: reveal on scroll within the scrollable content pane
  gsap.utils.toArray('.grid-2 [data-reveal]').forEach((card) => {
    gsap.fromTo(card,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.65, ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          scroller: '.content',
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  setTimeout(() => { animateChartBars(); animateProjectBars(); }, 900);
}

/* ============================================================
   12. Context menu (project rows)
   ============================================================ */
function initContextMenu() {
  const menu = $('#contextMenu');
  if (!menu) return;
  let activeRow = null;

  function open(x, y, row) {
    activeRow = row;
    const { innerWidth, innerHeight } = window;
    const menuW = 190, menuH = 170;
    const posX = Math.min(x, innerWidth - menuW - 12);
    const posY = Math.min(y, innerHeight - menuH - 12);
    menu.style.left = `${posX}px`;
    menu.style.top = `${posY}px`;
    menu.classList.add('is-open');
    gsap.fromTo(menu, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' });
  }
  function close() {
    gsap.to(menu, { opacity: 0, scale: 0.96, duration: 0.14, onComplete: () => menu.classList.remove('is-open') });
  }

  document.addEventListener('contextmenu', (e) => {
    const row = e.target.closest('.project-row');
    if (!row) { if (menu.classList.contains('is-open')) close(); return; }
    e.preventDefault();
    open(e.clientX, e.clientY, row);
  });

  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  $$('.context-menu__item', menu).forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const name = activeRow?.querySelector('.project-row__name')?.textContent || 'プロジェクト';
      const messages = {
        rename: `「${name}」の名前を変更します`,
        pin: `「${name}」をピン留めしました`,
        archive: `「${name}」をアーカイブしました`,
        delete: `「${name}」を削除しました`,
      };
      close();
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  initDateHeader();
  renderProjects();
  renderTeam();
  renderActivity();
  renderCalendar();
  renderChart();

  initSidebar();
  initTopbarPopovers();
  initCommandPalette();
  initDialog();
  initQuickActions();
  initContextMenu();

  initLoadSequence();
  resolveSkeletons();
});
