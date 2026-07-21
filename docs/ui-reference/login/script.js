/* ============================================================
   Vantage — Login
   script.js — orchestration only, no real auth logic
   ============================================================ */

/* ---------- Utilities ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============================================================
   1. Ambient background — cursor-reactive glow + parallax aurora
   ============================================================ */
function initAmbientBackground() {
  const glow = $('#cursorGlow');
  const auroraA = $('.bg__aurora--a');
  const auroraB = $('.bg__aurora--b');
  if (!glow) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  gsap.set(glow, { x: currentX, y: currentY });

  gsap.ticker.add(() => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    gsap.set(glow, { x: currentX, y: currentY });

    const nx = (targetX / window.innerWidth - 0.5);
    const ny = (targetY / window.innerHeight - 0.5);
    gsap.set(auroraA, { x: nx * 40, y: ny * 30 });
    gsap.set(auroraB, { x: nx * -30, y: ny * -20 });
  });

  gsap.to('.bg__aurora--a', {
    y: '+=24', duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1
  });
  gsap.to('.bg__aurora--b', {
    y: '-=28', duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5
  });
}

/* ============================================================
   2. Page-load choreography
   ============================================================ */
function initLoadSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.bg', { opacity: 1, duration: 1.1 }, 0)
    .fromTo('.card',
      { y: 28, opacity: 0, scale: 0.985 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out' },
      0.05)
    .to('.brand', { opacity: 1, y: 0, duration: 0.6 }, 0.35)
    .fromTo('.mark-path', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.09, ease: 'power2.out' }, 0.4)
    .to('.mark-dot', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(3)' }, 0.75)
    .fromTo('.mark-dot', { scale: 0 }, { scale: 1, duration: 0.01 }, 0.4)
    .to('.intro', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
    .to('.field', { opacity: 1, y: 0, duration: 0.55, stagger: 0.09 }, 0.62)
    .to('.form__meta', { opacity: 1, duration: 0.5 }, 0.85)
    .to('.btn--primary', { opacity: 1, y: 0, duration: 0.55 }, 0.92)
    .to('.divider', { opacity: 1, duration: 0.45 }, 1.02)
    .to('.oauth', { opacity: 1, duration: 0.5 }, 1.08)
    .to('.signup-hint', { opacity: 1, duration: 0.45 }, 1.18)
    .to('.legal', { opacity: 1, duration: 0.45 }, 1.28);

  gsap.set(['.field', '.form__meta', '.btn--primary', '.oauth', '.signup-hint', '.legal'], { y: 10 });
  tl.fromTo('.field', { y: 10 }, { y: 0, duration: 0.55, stagger: 0.09 }, 0.62);
}

/* ============================================================
   3. Card hover tilt (subtle, mouse-reactive)
   ============================================================ */
function initCardTilt() {
  const card = $('#loginCard');
  if (!card) return;
  const strength = 5;

  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: px * strength,
      rotateX: -py * strength,
      transformPerspective: 900,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
  card.addEventListener('pointerleave', () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.6)' });
  });
}

/* ============================================================
   4. Password visibility toggle
   ============================================================ */
function initPasswordToggle() {
  const toggle = $('#togglePassword');
  const input = $('#password');
  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    gsap.fromTo(toggle, { scale: 0.75 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
  });
}

/* ============================================================
   5. Toasts
   ============================================================ */
function showToast(message, type = 'success') {
  const host = $('#toastHost');
  if (!host) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
  toast.innerHTML = `
    <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'error'
        ? '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'
        : '<path d="M20 6L9 17l-5-5"/>'}
    </svg>
    <span>${message}</span>
  `;
  host.appendChild(toast);

  gsap.fromTo(toast,
    { y: -16, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
  );

  setTimeout(() => {
    gsap.to(toast, {
      y: -12, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => toast.remove()
    });
  }, 3200);
}

/* ============================================================
   6. Form submit — dummy loading + toast feedback
   ============================================================ */
function initFormSubmit() {
  const form = $('#loginForm');
  const btn = $('#submitBtn');
  if (!form || !btn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#email').value.trim();
    const password = $('#password').value.trim();

    if (!email || !password) {
      shakeCard();
      showToast('メールアドレスとパスワードを入力してください', 'error');
      return;
    }

    btn.classList.add('is-loading');
    setTimeout(() => {
      btn.classList.remove('is-loading');
      showToast('これはデザインモックアップです — 実際の認証は行われません');
    }, 1400);
  });
}

function shakeCard() {
  const card = $('#loginCard');
  gsap.fromTo(card,
    { x: 0 },
    { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' }
  );
}

/* ============================================================
   7. OAuth buttons — dummy
   ============================================================ */
function initOAuthButtons() {
  const google = $('#googleBtn');
  const github = $('#githubBtn');

  [google, github].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const provider = btn === google ? 'Google' : 'GitHub';
      gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
      showToast(`${provider} 認証はこのデモでは無効です`);
    });
  });
}

/* ============================================================
   8. Forgot-password dialog
   ============================================================ */
function initDialog() {
  const overlay = $('#dialogOverlay');
  const dialog = $('#dialog');
  const trigger = $('#forgotTrigger');
  const closeBtn = $('#dialogClose');
  const sendBtn = $('#resetSendBtn');
  if (!overlay || !dialog || !trigger) return;

  function open() {
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(dialog,
      { opacity: 0, scale: 0.94, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    );
    document.body.style.overflow = 'hidden';
  }

  function close() {
    gsap.to(dialog, { opacity: 0, scale: 0.96, y: 8, duration: 0.25, ease: 'power2.in' });
    gsap.to(overlay, {
      opacity: 0, duration: 0.28, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const emailInput = $('#resetEmail');
      if (!emailInput.value.trim()) {
        gsap.fromTo(emailInput.closest('.field__control'), { x: 0 }, { x: 6, duration: 0.06, repeat: 5, yoyo: true, clearProps: 'x' });
        return;
      }
      sendBtn.classList.add('is-loading');
      setTimeout(() => {
        sendBtn.classList.remove('is-loading');
        close();
        showToast('リセットリンクを送信しました（デモ）');
      }, 1200);
    });
  }
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  gsap.set('.bg', { opacity: 0 });
  initAmbientBackground();
  initLoadSequence();
  initCardTilt();
  initPasswordToggle();
  initFormSubmit();
  initOAuthButtons();
  initDialog();
});
