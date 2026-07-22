/* ============================================================
   Vantage — Project List
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
const PROJECTS = [
  { id: 1, name: 'ブランドリニューアル', desc: 'コーポレートアイデンティティとロゴシステムの刷新', icon: '🪐', color: '#9a85ff', status: 'active', tags: ['Design', 'Marketing'], progress: 72, due: '3日後', soon: true, updated: 1, members: [{ i: 'AW', n: 'Aria Whitfield' }, { i: 'MS', n: 'Mika Sato' }, { i: 'TK', n: 'Tom Keller' }] },
  { id: 2, name: 'モバイルアプリ v2', desc: 'iOS / Android 向けの全面リニューアル', icon: '🧭', color: '#55d19b', status: 'active', tags: ['Engineering'], progress: 45, due: '来週', soon: false, updated: 2, members: [{ i: 'JL', n: 'Julia Lang' }, { i: 'RN', n: 'Ren Nakata' }] },
  { id: 3, name: 'Q3 マーケティング計画', desc: '四半期のキャンペーン戦略とチャネル配分', icon: '📊', color: '#f2b25c', status: 'review', tags: ['Marketing', 'Growth'], progress: 88, due: '明日', soon: true, updated: 3, members: [{ i: 'AW', n: 'Aria Whitfield' }, { i: 'JL', n: 'Julia Lang' }, { i: 'MS', n: 'Mika Sato' }, { i: 'TK', n: 'Tom Keller' }] },
  { id: 4, name: 'API 基盤移行', desc: 'マイクロサービスへの段階的な移行計画', icon: '🛠️', color: '#ff8fa3', status: 'active', tags: ['Engineering'], progress: 30, due: '2週間後', soon: false, updated: 4, members: [{ i: 'TK', n: 'Tom Keller' }, { i: 'RN', n: 'Ren Nakata' }] },
  { id: 5, name: 'デザインシステム統一', desc: 'コンポーネントライブラリとトークンの一元化', icon: '🎨', color: '#5cc8f2', status: 'planning', tags: ['Design'], progress: 60, due: '5日後', soon: false, updated: 5, members: [{ i: 'MS', n: 'Mika Sato' }, { i: 'AW', n: 'Aria Whitfield' }] },
  { id: 6, name: 'ユーザーリサーチ 2026', desc: '主要ペルソナへのインタビューと分析', icon: '🔍', color: '#e88ef0', status: 'planning', tags: ['Research'], progress: 12, due: '3週間後', soon: false, updated: 6, members: [{ i: 'DP', n: 'Dev Patel' }] },
  { id: 7, name: 'オンボーディング改善', desc: '新規ユーザーの初回体験フローの最適化', icon: '🚀', color: '#9a85ff', status: 'done', tags: ['Design', 'Growth'], progress: 100, due: '完了', soon: false, updated: 7, members: [{ i: 'EC', n: 'Elena Cho' }, { i: 'AW', n: 'Aria Whitfield' }, { i: 'SB', n: 'Sam Brooks' }] },
  { id: 8, name: 'パフォーマンス最適化', desc: 'Core Web Vitals とロード時間の改善', icon: '⚡', color: '#55d19b', status: 'review', tags: ['Engineering'], progress: 78, due: '4日後', soon: false, updated: 8, members: [{ i: 'EC', n: 'Elena Cho' }, { i: 'TK', n: 'Tom Keller' }] },
  { id: 9, name: 'サマーキャンペーン', desc: 'シーズナルプロモーションのクリエイティブ制作', icon: '☀️', color: '#f2b25c', status: 'done', tags: ['Marketing'], progress: 100, due: '完了', soon: false, updated: 9, members: [{ i: 'SB', n: 'Sam Brooks' }, { i: 'MS', n: 'Mika Sato' }] },
];

const STATUS_LABEL = { active: '進行中', review: 'レビュー中', planning: '計画中', done: '完了' };

const state = {
  search: '',
  status: 'all',
  tags: new Set(),
  sort: 'updated',
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
  }, 3000);
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
function createDropdown(trigger, panel, { onOpen, anchor } = {}) {
  if (!trigger || !panel) return null;

  function position() {
    if (!anchor) return;
    const rect = trigger.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.left = `${Math.min(rect.left, window.innerWidth - panel.offsetWidth - 12)}px`;
    panel.style.right = 'auto';
  }

  function open() {
    closeAllDropdowns(panel);
    if (anchor) position();
    panel.classList.add('is-open');
    gsap.fromTo(panel, { opacity: 0, y: -8, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out' });
    onOpen?.();
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

function closeAllDropdowns(except) {
  $$('.dropdown.is-open').forEach((panel) => {
    if (panel === except) return;
    gsap.to(panel, { opacity: 0, y: -6, scale: 0.98, duration: 0.14, onComplete: () => panel.classList.remove('is-open') });
  });
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
   4. Toolbar: search / status tabs / filter / sort / view
   ============================================================ */
function initSearch() {
  const input = $('#projectSearch');
  const clearBtn = $('#searchClear');
  input.addEventListener('input', () => {
    state.search = input.value.trim().toLowerCase();
    clearBtn.hidden = state.search.length === 0;
    renderGrid();
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    state.search = '';
    clearBtn.hidden = true;
    input.focus();
    renderGrid();
  });
}

function initStatusTabs() {
  const tabs = $$('.status-tab');
  const highlight = $('#tabHighlight');

  function movePill(tab) {
    const parentRect = tab.parentElement.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    gsap.to(highlight, {
      x: rect.left - parentRect.left - 3,
      width: rect.width,
      duration: 0.4,
      ease: 'power3.out'
    });
    tab.appendChild(highlight);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      movePill(tab);
      state.status = tab.getAttribute('data-status');
      renderGrid();
    });
  });

  requestAnimationFrame(() => movePill($('.status-tab.is-active')));
  window.addEventListener('resize', () => movePill($('.status-tab.is-active')));
}

function initFilter() {
  const dd = createDropdown($('#filterBtn'), $('#filterDropdown'));
  const checkboxes = $$('#filterList input[type="checkbox"]');
  const countBadge = $('#filterCount');

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.tags.add(cb.value); else state.tags.delete(cb.value);
      countBadge.textContent = state.tags.size;
      countBadge.hidden = state.tags.size === 0;
      renderGrid();
    });
  });

  $('#filterClear')?.addEventListener('click', () => {
    checkboxes.forEach((cb) => { cb.checked = false; });
    state.tags.clear();
    countBadge.hidden = true;
    renderGrid();
  });
}

function initSort() {
  createDropdown($('#sortBtn'), $('#sortDropdown'));
  const options = $$('.sort-option');
  const label = $('#sortLabel');
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      state.sort = opt.getAttribute('data-sort');
      label.textContent = opt.textContent.trim();
      renderGrid();
    });
  });
}

function initViewToggle() {
  const gridBtn = $('#viewGrid');
  const listBtn = $('#viewList');
  const grid = $('#projectGrid');
  gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('is-active'); listBtn.classList.remove('is-active');
    grid.style.gridTemplateColumns = '';
  });
  listBtn.addEventListener('click', () => {
    listBtn.classList.add('is-active'); gridBtn.classList.remove('is-active');
    grid.style.gridTemplateColumns = '1fr';
    showToast('リスト表示はこのデモでは簡易表示です');
  });
}

/* ============================================================
   5. Filtering / sorting logic
   ============================================================ */
function getFilteredProjects() {
  let list = PROJECTS.filter((p) => {
    const matchesSearch = !state.search || p.name.toLowerCase().includes(state.search) || p.desc.toLowerCase().includes(state.search);
    const matchesStatus = state.status === 'all' || p.status === state.status;
    const matchesTags = state.tags.size === 0 || p.tags.some((t) => state.tags.has(t));
    return matchesSearch && matchesStatus && matchesTags;
  });

  const sorters = {
    updated: (a, b) => a.updated - b.updated,
    name: (a, b) => a.name.localeCompare(b.name, 'ja'),
    progress: (a, b) => b.progress - a.progress,
    due: (a, b) => (a.soon === b.soon ? 0 : a.soon ? -1 : 1),
  };
  list = list.sort(sorters[state.sort] || sorters.updated);
  return list;
}

/* ============================================================
   6. Card rendering
   ============================================================ */
function cardTemplate(p) {
  const avatarsHtml = p.members.slice(0, 3).map((m) => `<span class="avatar avatar--xs">${m.i}</span>`).join('');
  const moreCount = p.members.length - 3;
  const moreHtml = moreCount > 0 ? `<span class="project-card__more">+${moreCount}</span>` : '';

  return `
    <article class="project-card" data-id="${p.id}" style="--pc:${p.color}">
      <div class="project-card__head">
        <span class="project-card__icon">${p.icon}</span>
        <button class="project-card__menu-btn" data-menu-trigger aria-label="メニュー">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>
        </button>
      </div>
      <h3 class="project-card__name">${p.name}</h3>
      <p class="project-card__desc">${p.desc}</p>
      <div class="project-card__tags">
        <span class="tag tag--status">${STATUS_LABEL[p.status]}</span>
        ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="project-card__progress">
        <div class="project-card__progress-row">
          <span>進捗</span>
          <span class="project-card__progress-pct">${p.progress}%</span>
        </div>
        <div class="project-card__bar"><div class="project-card__bar-fill" data-target="${p.progress}"></div></div>
      </div>
      <div class="project-card__footer">
        <div class="project-card__avatars" data-members-trigger>${avatarsHtml}${moreHtml}</div>
        <span class="project-card__due ${p.soon ? 'project-card__due--soon' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${p.due}
        </span>
      </div>
    </article>
  `;
}

function renderGrid() {
  const grid = $('#projectGrid');
  const empty = $('#emptyState');
  const list = getFilteredProjects();

  $('#totalCount').textContent = PROJECTS.length;

  if (list.length === 0) {
    grid.innerHTML = '';
    grid.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.hidden = false;
  grid.innerHTML = list.map(cardTemplate).join('');

  gsap.fromTo('.project-card',
    { opacity: 0, y: 20, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
  );

  gsap.utils.toArray('.project-card__bar-fill').forEach((fill, i) => {
    const target = fill.getAttribute('data-target');
    gsap.to(fill, { width: `${target}%`, duration: 0.9, delay: 0.15 + i * 0.05, ease: 'power3.out' });
  });

  bindCardMenus();
  bindMemberPopovers();
}

/* ============================================================
   7. Card ••• dropdown menu
   ============================================================ */
let activeCardId = null;

function bindCardMenus() {
  const menu = $('#cardMenu');
  $$('[data-menu-trigger]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card');
      activeCardId = card.getAttribute('data-id');
      openFloating(menu, btn, { align: 'right' });
    });
  });
}

function bindMemberPopovers() {
  const pop = $('#membersPopover');
  $$('[data-members-trigger]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = el.closest('.project-card');
      const id = parseInt(card.getAttribute('data-id'), 10);
      const project = PROJECTS.find((p) => p.id === id);
      $('#membersList').innerHTML = project.members.map((m) => `
        <div class="member-row">
          <span class="avatar avatar--xs avatar--grad">${m.i}</span>
          <span class="member-row__name">${m.n}</span>
        </div>
      `).join('');
      openFloating(pop, el, { align: 'left' });
    });
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

function initCardMenuActions() {
  $$('#cardMenu .dropdown__item').forEach((item) => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const project = PROJECTS.find((p) => p.id === parseInt(activeCardId, 10));
      const name = project ? project.name : 'プロジェクト';
      const messages = {
        open: `「${name}」を開きます`,
        rename: `「${name}」の名前を変更します`,
        duplicate: `「${name}」を複製しました`,
        archive: `「${name}」をアーカイブしました`,
        delete: `「${name}」を削除しました`,
      };
      $('#cardMenu').classList.remove('is-open');
      showToast(messages[action] || '操作を実行しました');
    });
  });
}

/* ============================================================
   8. New project dialog
   ============================================================ */
function initDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const closeBtn = $('#dialogClose');
  const createBtn = $('#createProjectBtn');
  const nameInput = $('#projectName');
  const swatches = $$('.swatch');

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
    gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInput?.focus(), 100);
  }
  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });
  }

  $('#newProjectBtn')?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      swatches.forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
    });
  });

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
   9. Command palette
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
   10. Skeleton → content
   ============================================================ */
function renderSkeleton() {
  const grid = $('#skeletonGrid');
  grid.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-card__icon"></div>
      <div class="skeleton skeleton-card__line" style="width:70%"></div>
      <div class="skeleton skeleton-card__line" style="width:90%"></div>
      <div class="skeleton skeleton-card__line" style="width:50%"></div>
      <div class="skeleton skeleton-card__bar"></div>
      <div class="skeleton-card__footer">
        <div class="skeleton skeleton-card__avatars"></div>
        <div class="skeleton skeleton-card__due"></div>
      </div>
    </div>
  `).join('');
}

function resolveSkeleton() {
  const skeletonGrid = $('#skeletonGrid');
  setTimeout(() => {
    gsap.to(skeletonGrid, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        skeletonGrid.hidden = true;
        renderGrid();
      }
    });
  }, 700);
}

/* ============================================================
   11. Load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.bg', { opacity: 1, duration: 1 }, 0)
    .fromTo('.sidebar', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.05)
    .fromTo('.topbar', { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.15)
    .fromTo('.page-head', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.28)
    .fromTo('.toolbar', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.4)
    .fromTo('#skeletonGrid', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.5);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  renderSkeleton();
  initSidebar();
  initTopbarPopovers();
  initSearch();
  initStatusTabs();
  initFilter();
  initSort();
  initViewToggle();
  initDialog();
  initCommandPalette();
  initCardMenuActions();

  $('#emptyClearBtn')?.addEventListener('click', () => {
    $('#projectSearch').value = '';
    state.search = '';
    state.status = 'all';
    state.tags.clear();
    $$('.status-tab').forEach((t) => t.classList.remove('is-active'));
    $('.status-tab[data-status="all"]').classList.add('is-active');
    $$('#filterList input').forEach((cb) => { cb.checked = false; });
    $('#filterCount').hidden = true;
    $('#searchClear').hidden = true;
    renderGrid();
  });

  initLoadSequence();
  resolveSkeleton();
});
