/* ============================================================
   Vantage — Settings
   script.js — data is mocked, all actions are dummy
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   Mock data
   ============================================================ */
let SESSIONS = [
  { id: 's1', device: 'MacBook Pro — Chrome', location: 'Sapporo, JP', time: '現在アクティブ', current: true },
  { id: 's2', device: 'iPhone 16 Pro — Vantage App', location: 'Sapporo, JP', time: '2時間前' },
  { id: 's3', device: 'iPad Air — Safari', location: 'Tokyo, JP', time: '3日前' },
];

let API_KEYS = [
  { id: 'k1', name: 'Production Server', masked: 'vk_live_••••••••a91c', created: '2026年3月12日', lastUsed: '2時間前' },
  { id: 'k2', name: 'CI/CD Pipeline', masked: 'vk_live_••••••••7f2e', created: '2026年5月2日', lastUsed: '昨日' },
];

let MEMBERS = [
  { id: 'm1', name: 'Aria Whitfield', email: 'aria@vantage.app', initials: 'AW', role: 'Owner', status: 'online' },
  { id: 'm2', name: 'Mika Sato', email: 'mika@vantage.app', initials: 'MS', role: 'Admin', status: 'online' },
  { id: 'm3', name: 'Tom Keller', email: 'tom@vantage.app', initials: 'TK', role: 'Member', status: 'away' },
  { id: 'm4', name: 'Julia Lang', email: 'julia@vantage.app', initials: 'JL', role: 'Member', status: 'online' },
  { id: 'm5', name: 'Ren Nakata', email: 'ren@vantage.app', initials: 'RN', role: 'Viewer', status: 'away' },
  { id: 'm6', name: 'Elena Cho', email: 'elena@vantage.app', initials: 'EC', role: 'Member', status: 'online' },
];

let INVITES = [
  { id: 'i1', email: 'sam.brooks@example.com', role: 'Member' },
  { id: 'i2', email: 'dev.patel@example.com', role: 'Viewer' },
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
   3. Generic dropdown + floating panel
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
   4. Settings nav (vertical sliding pill + panel switch)
   ============================================================ */
function initSettingsNav() {
  const items = $$('.settings-nav__item');
  const pill = $('#navPill');
  const panels = $$('.settings-panel');

  function movePill(item) {
    const nav = $('#settingsNav');
    const navRect = nav.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    gsap.to(pill, { top: rect.top - navRect.top, height: rect.height, duration: 0.4, ease: 'power3.out' });
  }

  function switchTo(key) {
    items.forEach((i) => i.classList.toggle('is-active', i.getAttribute('data-panel') === key));
    panels.forEach((p) => {
      if (p.getAttribute('data-panel') === key) {
        p.hidden = false;
        gsap.fromTo(p, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        p.hidden = true;
      }
    });
  }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      movePill(item);
      switchTo(item.getAttribute('data-panel'));
    });
  });

  requestAnimationFrame(() => movePill($('.settings-nav__item.is-active')));
  window.addEventListener('resize', () => movePill($('.settings-nav__item.is-active')));

  window.gotoSettingsPanel = (key) => {
    const item = $(`.settings-nav__item[data-panel="${key}"]`);
    if (item) { movePill(item); switchTo(key); }
  };
}

/* ============================================================
   5. Toggle switches (generic)
   ============================================================ */
function initToggles() {
  $$('.toggle-switch').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const isOn = toggle.classList.toggle('is-on');
      toggle.setAttribute('aria-checked', String(isOn));
      gsap.fromTo(toggle, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
      const row = toggle.closest('.toggle-row');
      const label = row ? $('.toggle-row__title', row)?.textContent : '設定';
      showToast(`${label}を${isOn ? 'オン' : 'オフ'}にしました`);
    });
  });
}

/* ============================================================
   6. Profile / Password / Workspace save actions
   ============================================================ */
function initSaveButtons() {
  bindSaveButton('#saveProfileBtn', 'プロフィールを保存しました');
  bindSaveButton('#savePasswordBtn', 'パスワードを更新しました');
  bindSaveButton('#saveWorkspaceBtn', 'ワークスペース設定を保存しました');

  $('#uploadPhotoBtn')?.addEventListener('click', () => showToast('写真のアップロードはこのデモでは無効です'));
  $('#removePhotoBtn')?.addEventListener('click', () => showToast('プロフィール写真を削除しました'));
  $('#upgradePlanLink')?.addEventListener('click', () => showToast('プラン変更はこのデモでは無効です'));
}

function bindSaveButton(selector, message) {
  const btn = $(selector);
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.add('is-loading');
    setTimeout(() => {
      btn.classList.remove('is-loading');
      gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      showToast(message);
    }, 1000);
  });
}

/* ============================================================
   7. Theme / accent / density pickers
   ============================================================ */
function initThemePickers() {
  $$('.theme-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.getAttribute('data-theme') !== 'dark') {
        showToast('このテーマは近日公開予定です');
        return;
      }
      $$('.theme-card').forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');
    });
  });

  $$('#accentSwatches .swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      $$('#accentSwatches .swatch').forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      showToast('アクセントカラーを変更しました');
    });
  });

  $$('.density-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      $$('.density-option').forEach((o) => o.classList.remove('is-active'));
      opt.classList.add('is-active');
      showToast(`密度を「${opt.textContent}」に変更しました`);
    });
  });
}

/* ============================================================
   8. Security: 2FA + sessions
   ============================================================ */
function init2FA() {
  const toggle = $('#twoFaToggle');
  toggle?.addEventListener('click', () => {
    const isOn = toggle.classList.contains('is-on');
    showToast(isOn ? '2要素認証を設定しました' : '2要素認証を無効にしました');
  });
}

function renderSessions() {
  const list = $('#sessionList');
  list.innerHTML = SESSIONS.map((s) => `
    <div class="session-row" data-id="${s.id}">
      <span class="session-row__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      </span>
      <div class="session-row__body">
        <p class="session-row__title">${s.device} ${s.current ? '<span class="session-badge">このデバイス</span>' : ''}</p>
        <p class="session-row__meta">${s.location} · ${s.time}</p>
      </div>
      ${s.current ? '' : `<button class="icon-btn icon-btn--sm" data-row-menu="${s.id}" data-tooltip="操作"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg></button>`}
    </div>
  `).join('');

  $$('[data-row-menu]', list).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openRowMenu(btn, { type: 'session', id: btn.getAttribute('data-row-menu') });
    });
  });
}

/* ============================================================
   9. API Keys
   ============================================================ */
function renderApiKeys() {
  const list = $('#apiKeyList');
  list.innerHTML = API_KEYS.map((k) => `
    <div class="api-key-row" data-id="${k.id}">
      <span class="api-key-row__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </span>
      <div class="api-key-row__body">
        <p class="api-key-row__title">${k.name}</p>
        <p class="api-key-row__value">${k.masked}</p>
        <p class="api-key-row__meta">${k.created} に発行 · 最終使用: ${k.lastUsed}</p>
      </div>
      <button class="icon-btn icon-btn--sm" data-row-menu="${k.id}" data-tooltip="操作"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg></button>
    </div>
  `).join('');

  $$('[data-row-menu]', list).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openRowMenu(btn, { type: 'apikey', id: btn.getAttribute('data-row-menu') });
    });
  });
}

function initApiKeyDialog() {
  const overlay = $('#apiKeyOverlay');
  const dialog = $('#apiKeyDialog');
  const stepCreate = $('#apiKeyStepCreate');
  const stepReveal = $('#apiKeyStepReveal');
  const nameInput = $('#apiKeyName');
  const generateBtn = $('#generateApiKeyBtn');

  function open() {
    stepCreate.hidden = false;
    stepReveal.hidden = true;
    nameInput.value = '';
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

  $('#newApiKeyBtn')?.addEventListener('click', open);
  $('#apiKeyClose')?.addEventListener('click', close);
  $('#apiKeyDoneBtn')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  generateBtn.addEventListener('click', () => {
    if (!nameInput.value.trim()) {
      gsap.fromTo(dialog, { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
      return;
    }
    generateBtn.classList.add('is-loading');
    setTimeout(() => {
      generateBtn.classList.remove('is-loading');
      const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const fullKey = `vk_live_${randomHex}`;
      $('#apiKeyRevealValue').textContent = fullKey;

      API_KEYS.push({
        id: `k${API_KEYS.length + 1}`,
        name: nameInput.value.trim(),
        masked: `vk_live_••••••••${randomHex.slice(-4)}`,
        created: '今日',
        lastUsed: '未使用',
      });
      renderApiKeys();

      stepCreate.hidden = true;
      stepReveal.hidden = false;
      gsap.fromTo(stepReveal, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }, 900);
  });

  $('#copyApiKeyBtn')?.addEventListener('click', () => showToast('キーをコピーしました'));
}

/* ============================================================
   10. Members + invites
   ============================================================ */
function renderMembers(filter = '') {
  const table = $('#memberTable');
  const q = filter.trim().toLowerCase();
  const filtered = MEMBERS.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));

  table.innerHTML = filtered.map((m) => `
    <div class="member-row" data-id="${m.id}">
      <span class="member-row__status ${m.status === 'away' ? 'member-row__status--away' : ''}"></span>
      <span class="avatar avatar--sm avatar--grad">${m.initials}</span>
      <div class="member-row__body">
        <p class="member-row__name">${m.name}</p>
        <p class="member-row__email">${m.email}</p>
      </div>
      <button class="member-row__role-btn" data-role-trigger="${m.id}" ${m.role === 'Owner' ? 'disabled' : ''}>
        ${m.role}
        ${m.role !== 'Owner' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' : ''}
      </button>
      ${m.role !== 'Owner' ? `<button class="member-row__remove" data-remove-member="${m.id}" data-tooltip="削除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` : '<span style="width:30px"></span>'}
    </div>
  `).join('');

  $('#memberCountDesc').textContent = `${MEMBERS.length} 名がこのワークスペースに参加しています`;

  $$('[data-role-trigger]', table).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openRoleDropdown(btn, btn.getAttribute('data-role-trigger'));
    });
  });
  $$('[data-remove-member]', table).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-remove-member');
      const member = MEMBERS.find((m) => m.id === id);
      openConfirmDialog({
        title: 'メンバーを削除しますか？',
        desc: `${member.name} をこのワークスペースから削除します。この操作は取り消せません。`,
        confirmLabel: '削除する',
        onConfirm: () => {
          MEMBERS = MEMBERS.filter((m) => m.id !== id);
          renderMembers($('#memberSearch').value);
          showToast(`${member.name} を削除しました`);
        }
      });
    });
  });
}

function openRoleDropdown(trigger, memberId) {
  const dropdown = $('#roleDropdown');
  openFloating(dropdown, trigger, { align: 'right' });
  $$('.role-option', dropdown).forEach((opt) => {
    opt.onclick = () => {
      const role = opt.getAttribute('data-role');
      const member = MEMBERS.find((m) => m.id === memberId);
      if (member) member.role = role;
      dropdown.classList.remove('is-open');
      renderMembers($('#memberSearch').value);
      showToast(`${member.name} の権限を ${role} に変更しました`);
    };
  });
}

function renderInvites() {
  const list = $('#inviteList');
  const empty = $('#inviteEmpty');
  if (INVITES.length === 0) {
    list.innerHTML = '';
    empty.classList.add('is-visible');
    return;
  }
  empty.classList.remove('is-visible');
  list.innerHTML = INVITES.map((inv) => `
    <div class="invite-row" data-id="${inv.id}">
      <span class="avatar avatar--sm">${inv.email.slice(0, 2).toUpperCase()}</span>
      <div class="invite-row__body">
        <p class="invite-row__name">招待中</p>
        <p class="invite-row__email">${inv.email}</p>
      </div>
      <span class="invite-row__role">${inv.role}</span>
      <button class="icon-btn icon-btn--sm" data-cancel-invite="${inv.id}" data-tooltip="招待を取り消す"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join('');

  $$('[data-cancel-invite]', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cancel-invite');
      INVITES = INVITES.filter((i) => i.id !== id);
      renderInvites();
      showToast('招待を取り消しました');
    });
  });
}

function initMemberSearch() {
  $('#memberSearch')?.addEventListener('input', (e) => renderMembers(e.target.value));
}

function initInviteButton() {
  $('#inviteMemberBtn')?.addEventListener('click', () => {
    INVITES.push({ id: `i${INVITES.length + 1}`, email: `new.member${INVITES.length + 1}@example.com`, role: 'Member' });
    renderInvites();
    showToast('招待メールを送信しました');
  });
}

/* ============================================================
   11. Row action menu (sessions / api keys)
   ============================================================ */
let activeRowTarget = null;

function openRowMenu(trigger, target) {
  activeRowTarget = target;
  const menu = $('#rowMenu');
  const label = $('.dropdown__item', menu);
  label.innerHTML = target.type === 'session'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>ログアウトさせる'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>失効させる';
  openFloating(menu, trigger, { align: 'right' });
}

function initRowMenu() {
  const menu = $('#rowMenu');
  $$('.dropdown__item', menu).forEach((item) => {
    item.addEventListener('click', () => {
      menu.classList.remove('is-open');
      if (!activeRowTarget) return;
      if (activeRowTarget.type === 'session') {
        const session = SESSIONS.find((s) => s.id === activeRowTarget.id);
        openConfirmDialog({
          title: 'このセッションをログアウトしますか？',
          desc: `${session.device} からログアウトします。`,
          confirmLabel: 'ログアウト',
          onConfirm: () => {
            SESSIONS = SESSIONS.filter((s) => s.id !== activeRowTarget.id);
            renderSessions();
            showToast('セッションをログアウトしました');
          }
        });
      } else if (activeRowTarget.type === 'apikey') {
        const key = API_KEYS.find((k) => k.id === activeRowTarget.id);
        openConfirmDialog({
          title: 'APIキーを失効させますか？',
          desc: `「${key.name}」を使用しているすべての連携が動作しなくなります。`,
          confirmLabel: '失効させる',
          onConfirm: () => {
            API_KEYS = API_KEYS.filter((k) => k.id !== activeRowTarget.id);
            renderApiKeys();
            showToast('APIキーを失効させました');
          }
        });
      }
    });
  });
}

/* ============================================================
   12. Generic confirm dialog
   ============================================================ */
let confirmCallback = null;

function openConfirmDialog({ title, desc, confirmLabel = '削除する', onConfirm }) {
  confirmCallback = onConfirm;
  $('#confirmTitle').textContent = title;
  $('#confirmDesc').textContent = desc;
  $('#confirmOk .btn__label').textContent = confirmLabel;

  const overlay = $('#confirmOverlay');
  const dialog = $('#confirmDialog');
  overlay.classList.add('is-open');
  gsap.to(overlay, { opacity: 1, duration: 0.28, ease: 'power2.out' });
  gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' });
  document.body.style.overflow = 'hidden';
}

function initConfirmDialog() {
  const overlay = $('#confirmOverlay');
  const dialog = $('#confirmDialog');

  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.22, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in', onComplete: () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; } });
  }

  $('#confirmClose')?.addEventListener('click', close);
  $('#confirmCancel')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  $('#confirmOk')?.addEventListener('click', () => {
    const btn = $('#confirmOk');
    btn.classList.add('is-loading');
    setTimeout(() => {
      btn.classList.remove('is-loading');
      close();
      confirmCallback?.();
    }, 900);
  });

  $('#deleteAccountBtn')?.addEventListener('click', () => {
    openConfirmDialog({
      title: 'アカウントを削除しますか？',
      desc: 'すべてのデータが完全に削除され、復元できません。',
      confirmLabel: 'アカウントを削除',
      onConfirm: () => showToast('アカウント削除のリクエストを受け付けました')
    });
  });

  $('#deleteWorkspaceBtn')?.addEventListener('click', () => {
    openConfirmDialog({
      title: 'ワークスペースを削除しますか？',
      desc: 'すべてのプロジェクト、タスク、メンバーのデータが完全に削除されます。',
      confirmLabel: 'ワークスペースを削除',
      onConfirm: () => showToast('ワークスペース削除のリクエストを受け付けました')
    });
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
    const goto = item.getAttribute('data-goto');
    close();
    if (goto) setTimeout(() => window.gotoSettingsPanel?.(goto), 250);
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
    .to('.settings-header', { opacity: 1, duration: 0.5 }, 0.28)
    .to('.settings-nav', { opacity: 1, duration: 0.5 }, 0.38)
    .to('.settings-content', { opacity: 1, duration: 0.5 }, 0.42)
    .to('.settings-card', { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.5);

  gsap.set('.settings-card', { y: 12 });
  tl.fromTo('.settings-card', { y: 12 }, { y: 0, duration: 0.5, stagger: 0.07 }, 0.5);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });

  initSidebar();
  initTopbarPopovers();
  initSettingsNav();
  initToggles();
  initSaveButtons();
  initThemePickers();
  init2FA();

  renderSessions();
  renderApiKeys();
  initApiKeyDialog();

  renderMembers();
  renderInvites();
  initMemberSearch();
  initInviteButton();

  initRowMenu();
  initConfirmDialog();
  initCommandPalette();

  initLoadSequence();
});
