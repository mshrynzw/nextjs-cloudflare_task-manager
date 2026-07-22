/* ============================================================
   Vantage — Profile
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const PROJECTS = [
  { icon: '🪐', color: '#9a85ff', name: 'ブランドリニューアル', role: 'Owner', progress: 72 },
  { icon: '🧭', color: '#55d19b', name: 'モバイルアプリ v2', role: 'Contributor', progress: 45 },
  { icon: '📊', color: '#f2b25c', name: 'Q3 マーケティング計画', role: 'Owner', progress: 88 },
  { icon: '🎨', color: '#5cc8f2', name: 'デザインシステム統一', role: 'Contributor', progress: 60 },
  { icon: '🚀', color: '#ff8fa3', name: 'オンボーディング改善', role: 'Owner', progress: 100 },
  { icon: '⚡', color: '#55d19b', name: 'パフォーマンス最適化', role: 'Contributor', progress: 78 },
];

const ACTIVITY = [
  { text: '「決済フロー PR」をレビューしました', time: '2時間前', icon: 'review' },
  { text: '「デザインレビュー」を完了としてマークしました', time: '5時間前', icon: 'check' },
  { text: '「モバイルアプリ v2」に3件のコメントを追加しました', time: '昨日', icon: 'comment' },
  { text: '「オンボーディング改善」プロジェクトを完了しました', time: '3日前', icon: 'complete' },
  { text: '「Q3 マーケティング計画」を作成しました', time: '5日前', icon: 'create' },
  { text: 'Tom Keller をチームに招待しました', time: '1週間前', icon: 'invite' },
];

const ICONS = {
  review: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  complete: '<path d="M20 6L9 17l-5-5"/>',
  create: '<path d="M12 5v14M5 12h14"/>',
  invite: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
};

const SKILLS = [
  { name: 'プロダクトデザイン', pct: 95 },
  { name: 'フロントエンド開発', pct: 82 },
  { name: 'ユーザーリサーチ', pct: 74 },
  { name: 'プロトタイピング', pct: 88 },
  { name: 'チームリーディング', pct: 90 },
];

const BADGES = [
  { icon: '🏆', label: '100 タスク達成' },
  { icon: '🔥', label: '30日連続稼働' },
  { icon: '⭐', label: 'トップ貢献者' },
  { icon: '🚀', label: '初期メンバー' },
];

const CONNECTIONS = [
  { initials: 'MS', name: 'Mika Sato', role: 'Designer', count: 42 },
  { initials: 'TK', name: 'Tom Keller', role: 'Engineer', count: 37 },
  { initials: 'JL', name: 'Julia Lang', role: 'Engineer', count: 25 },
  { initials: 'EC', name: 'Elena Cho', role: 'Engineer', count: 19 },
];

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
   2. Sidebar + dropdowns
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

function initTopbarPopovers() {
  createDropdown($('#notifBtn'), $('#notifDropdown'));
  createDropdown($('#profileBtn'), $('#profileDropdown'));
  createDropdown($('#profileMenuBtn'), $('#profileMenu'));
  $('#clearNotifs')?.addEventListener('click', () => {
    $('#notifList').style.display = 'none';
    $('#notifEmpty').classList.add('is-visible');
    $('#notifBadge').style.display = 'none';
    showToast('すべての通知を既読にしました');
  });
  $$('#profileMenu .dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      $('#profileMenu').classList.remove('is-open');
      showToast(action === 'share' ? 'プロフィールリンクをコピーしました' : 'データのエクスポートを開始しました');
    });
  });
}

/* ============================================================
   3. Hero actions
   ============================================================ */
function initHeroActions() {
  $('#messageBtn')?.addEventListener('click', () => showToast('メッセージ画面はこのデモでは無効です'));
  $('#assignBtn')?.addEventListener('click', () => showToast('タスク割り当てダイアログを開きます'));
}

/* ============================================================
   4. Stat counters
   ============================================================ */
function animateCounters() {
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.5, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix; }
    });
  });
}

/* ============================================================
   5. Activity heatmap
   ============================================================ */
function renderHeatmap() {
  const WEEKS = 26;
  const grid = $('#heatmapGrid');
  const monthsRow = $('#heatmapMonths');
  const totalEl = $('#heatmapTotal');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = WEEKS * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (totalDays - 1));
  const startDay = startDate.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  startDate.setDate(startDate.getDate() + mondayOffset);

  let totalCount = 0;
  let cellsHtml = '';
  const monthMarkers = [];
  let lastMonth = null;

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(cellDate.getDate() + week * 7 + day);
      const isFuture = cellDate > today;

      let level = 0;
      let count = 0;
      if (!isFuture) {
        const rand = Math.random();
        const weekday = cellDate.getDay();
        const weekendPenalty = (weekday === 0 || weekday === 6) ? 0.3 : 1;
        const r = rand * weekendPenalty;
        if (r > 0.88) { level = 4; count = 8 + Math.floor(Math.random() * 6); }
        else if (r > 0.72) { level = 3; count = 5 + Math.floor(Math.random() * 3); }
        else if (r > 0.5) { level = 2; count = 2 + Math.floor(Math.random() * 3); }
        else if (r > 0.28) { level = 1; count = 1; }
        totalCount += count;
      }

      if (day === 0) {
        const m = cellDate.getMonth();
        if (m !== lastMonth) {
          monthMarkers.push({ week, label: new Intl.DateTimeFormat('ja-JP', { month: 'short' }).format(cellDate) });
          lastMonth = m;
        }
      }

      const dateLabel = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric' }).format(cellDate);
      const tooltip = isFuture ? '' : `data-tooltip="${dateLabel}: ${count} 件"`;
      cellsHtml += `<span class="heatmap__cell" data-level="${isFuture ? '' : level}" ${tooltip} style="visibility:${isFuture ? 'hidden' : 'visible'}"></span>`;
    }
  }

  grid.innerHTML = cellsHtml;
  monthsRow.innerHTML = monthMarkers.map((m) => `<span style="grid-column:${m.week + 1}">${m.label}</span>`).join('');
  totalEl.textContent = `${totalCount.toLocaleString()} 件`;

  gsap.fromTo('.heatmap__cell[data-level]',
    { opacity: 0, scale: 0.4 },
    { opacity: 1, scale: 1, duration: 0.4, stagger: { each: 0.0025, from: 'start' }, ease: 'power2.out', delay: 0.2 }
  );
}

/* ============================================================
   6. Mini projects
   ============================================================ */
function renderProjects() {
  const grid = $('#miniProjectGrid');
  grid.innerHTML = PROJECTS.map((p) => `
    <div class="mini-project-card" style="--pc:${p.color}">
      <span class="mini-project-card__icon" style="background:color-mix(in srgb, ${p.color} 18%, transparent)">${p.icon}</span>
      <div class="mini-project-card__body">
        <p class="mini-project-card__name">${p.name}</p>
        <p class="mini-project-card__role">${p.role}</p>
      </div>
      <span class="mini-project-card__pct">${p.progress}%</span>
    </div>
  `).join('');

  $$('.mini-project-card', grid).forEach((card) => {
    card.addEventListener('click', () => {
      const name = $('.mini-project-card__name', card).textContent;
      showToast(`「${name}」を開きます`);
    });
  });
}

/* ============================================================
   7. Activity timeline
   ============================================================ */
function renderActivity() {
  const timeline = $('#activityTimeline');
  timeline.innerHTML = ACTIVITY.map((a) => `
    <div class="timeline-item">
      <span class="timeline-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icon] || ICONS.create}</svg></span>
      <div class="timeline-item__body">
        <p>${a.text}</p>
        <span class="timeline-item__time">${a.time}</span>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   8. Skills
   ============================================================ */
function renderSkills() {
  const list = $('#skillList');
  list.innerHTML = SKILLS.map((s) => `
    <div class="skill-row">
      <div class="skill-row__head"><span class="skill-row__name">${s.name}</span><span class="skill-row__pct">${s.pct}%</span></div>
      <div class="skill-row__bar"><div class="skill-row__bar-fill" data-target="${s.pct}"></div></div>
    </div>
  `).join('');
}

function animateSkillBars() {
  gsap.utils.toArray('.skill-row__bar-fill').forEach((fill, i) => {
    const target = fill.getAttribute('data-target');
    gsap.to(fill, { width: `${target}%`, duration: 1, delay: 0.1 * i, ease: 'power3.out' });
  });
}

/* ============================================================
   9. Badges
   ============================================================ */
function renderBadges() {
  const grid = $('#badgeGrid');
  grid.innerHTML = BADGES.map((b) => `
    <div class="badge-item" data-tooltip="${b.label}">
      <span class="badge-item__icon">${b.icon}</span>
      <span class="badge-item__label">${b.label}</span>
    </div>
  `).join('');
}

/* ============================================================
   10. Connections
   ============================================================ */
function renderConnections() {
  const list = $('#connectionList');
  list.innerHTML = CONNECTIONS.map((c) => `
    <div class="connection-row">
      <span class="avatar avatar--sm avatar--grad">${c.initials}</span>
      <div class="connection-row__body">
        <p class="connection-row__name">${c.name}</p>
        <p class="connection-row__meta">${c.role}</p>
      </div>
      <span class="connection-row__count">${c.count} 件協働</span>
    </div>
  `).join('');
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
   12. Load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .to('.profile-hero', { opacity: 1, duration: 0.6 }, 0.25)
    .fromTo('.profile-hero__avatar', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2)' }, 0.35)
    .to('.stat-grid', { opacity: 1, duration: 0.5 }, 0.5)
    .to('.stat-card', { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 }, 0.55)
    .to('.profile-main .panel, .profile-side .panel', { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.68);

  gsap.set('.stat-card', { y: 14, opacity: 0 });
  gsap.set('.profile-main .panel, .profile-side .panel', { y: 14 });

  setTimeout(() => { animateCounters(); animateSkillBars(); }, 1100);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  initSidebar();
  initTopbarPopovers();
  initHeroActions();

  renderHeatmap();
  renderProjects();
  renderActivity();
  renderSkills();
  renderBadges();
  renderConnections();

  initCommandPalette();
  initLoadSequence();
});
