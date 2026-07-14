// ============================================================
// COUNTDOWN BACKGROUND
// ============================================================
(function() {
  const canvas = document.getElementById('countdownBg');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('countdownOverlay');
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = overlay.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  let bgStars = [],
    glowPoints = [];

  function initBackground() {
    bgStars = [];
    const starCount = Math.floor((W * H) / 4000);
    for (let i = 0; i < starCount; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 1.6,
        brightness: 0.3 + Math.random() * 0.7,
        isLarge: Math.random() > 0.85
      });
    }
    glowPoints = [];
    const glowCount = Math.max(3, Math.floor(Math.min(W, H) / 200));
    for (let i = 0; i < glowCount; i++) {
      glowPoints.push({
        x: Math.random() * W,
        y: Math.random() * H,
        radius: 80 + Math.random() * 200,
        intensity: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.1,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6
      });
    }
  }

  function drawBackground(time) {
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
    grad.addColorStop(0, '#121218');
    grad.addColorStop(0.4, '#0c0c10');
    grad.addColorStop(0.7, '#08080a');
    grad.addColorStop(1, '#040405');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (const g of glowPoints) {
      const pulse = 0.8 + 0.2 * Math.sin(time * g.speed + g.phase);
      const r = g.radius * pulse;
      const alpha = g.intensity * (0.7 + 0.3 * Math.sin(time * g.speed * 0.7 + g.phase));
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      grd.addColorStop(0, `rgba(180,190,220,${alpha * 0.6})`);
      grd.addColorStop(0.5, `rgba(120,140,180,${alpha * 0.3})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
      ctx.fill();
      g.x += g.dx * 0.002;
      g.y += g.dy * 0.002;
      if (g.x < -r) g.x = W + r;
      if (g.x > W + r) g.x = -r;
      if (g.y < -r) g.y = H + r;
      if (g.y > H + r) g.y = -r;
    }

    for (const s of bgStars) {
      const tw = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
      const alpha = 0.15 + tw * 0.65 * s.brightness;
      ctx.globalAlpha = alpha;
      if (s.isLarge) {
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        grd.addColorStop(0, `rgba(255,255,255,${alpha * 0.5})`);
        grd.addColorStop(0.3, `rgba(200,210,240,${alpha * 0.2})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(180,190,220,0.3)';
      ctx.shadowBlur = s.isLarge ? 8 : 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  let animationId = null;

  function animate(time) {
    const elapsed = time / 1000;
    drawBackground(elapsed);
    animationId = requestAnimationFrame(animate);
  }

  initBackground();
  animate(0);

  window.addEventListener('resize', () => {
    resize();
    initBackground();
  });

  const observer = new MutationObserver(() => {
    if (overlay.classList.contains('hidden')) {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    } else {
      if (!animationId) {
        initBackground();
        animate(0);
      }
    }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
})();


// ============================================================
// COUNTDOWN TIMER
// ============================================================
(function() {
  const TARGET = new Date(2026, 6, 15, 0, 0, 0, 0).getTime();
  const daysEl = document.getElementById('days'),
    hoursEl = document.getElementById('hours'),
    minutesEl = document.getElementById('minutes'),
    secondsEl = document.getElementById('seconds'),
    overlay = document.getElementById('countdownOverlay');

  function pad(n) { return String(n).padStart(2, '0'); }

  function getTimeComponents(now) {
    let diff = TARGET - now;
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, diff };
  }

  function revealRocketPage() {
    overlay.classList.add('hidden');
    const rocketSection = document.getElementById('rocketSection');
    rocketSection.classList.remove('hidden');
    rocketSection.style.pointerEvents = 'auto';
    document.body.classList.add('unlocked');
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
  }

  function updateCountdown() {
    const now = Date.now();
    const { days, hours, minutes, seconds, diff } = getTimeComponents(now);
    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
    if (diff <= 0 && !overlay.classList.contains('hidden')) {
      setTimeout(revealRocketPage, 300);
    }
  }

  if (Date.now() >= TARGET) {
    setTimeout(revealRocketPage, 200);
  } else {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) updateCountdown();
  });
})();


// ============================================================
// ROCKET CANVAS ANIMATION
// ============================================================
(function() {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('rocketSection');
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = section.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  const COLORS = ['#ff5fa2', '#ffd23f', '#3fd6ff', '#7a5cff', '#5cff8f', '#ff7a3f', '#ff5f5f', '#9bdcff', '#c98bff', '#ffe28a'];

  function pickColor(i) { return COLORS[i % COLORS.length]; }

  const LINE1 = "HAPPY",
    LINE2 = "BIRTHDAY!";
  let letters = [],
    particles = [],
    bgStars = [],
    glowPoints = [];
  let LAUNCH_X = 0,
    LAUNCH_Y = 0;

  class Letter {
    constructor(ch, color, fontSize, tx, ty) {
      this.ch = ch;
      this.color = color;
      this._fontSize = fontSize;
      this.fontSize = fontSize;
      this._tx = tx;
      this._ty = ty;
      this.tx = tx;
      this.ty = ty;
      this.launchDelay = 0.1 + Math.random() * 0.45;
      this.launchDuration = 0.55 + Math.random() * 0.3;
      this.reset();
    }

    reset() {
      this.state = 'launching';
      this.t = 0;
      this.x = LAUNCH_X;
      this.y = LAUNCH_Y;
      this.opacity = 0;
      this.burstDone = false;
      this.burstTime = 0;
      this.driftX = (Math.random() - 0.5) * 2;
      this.driftY = (Math.random() - 0.5) * 2;
    }

    update(dt, time) {
      if (this.state === 'gone') return false;
      const delay = this.launchDelay,
        dur = this.launchDuration;
      if (time < delay) {
        this.opacity = 0;
        this.x = LAUNCH_X + this.driftX * 0.5;
        this.y = LAUNCH_Y + this.driftY * 0.5;
        return false;
      }
      const localT = time - delay;
      if (localT < dur) {
        const progress = Math.min(1, localT / dur);
        const ease = 1 - Math.pow(1 - progress, 3);
        this.x = LAUNCH_X + (this.tx - LAUNCH_X) * ease + this.driftX * 0.3 * (1 - ease);
        this.y = LAUNCH_Y + (this.ty - LAUNCH_Y) * ease + this.driftY * 0.3 * (1 - ease);
        this.opacity = Math.min(1, localT / (dur * 0.4));
        if (Math.random() < 0.55) spawnTrailParticle(this.x, this.y + this.fontSize * 0.3, this.color);
        this.burstDone = false;
        return false;
      }
      if (!this.burstDone) {
        this.burstDone = true;
        this.burstTime = time;
        spawnBurst(this.tx, this.ty, this.color);
      }
      this.x = this.tx + this.driftX * 0.1;
      this.y = this.ty + this.driftY * 0.1;
      this.opacity = 1;
      return true;
    }

    draw(time) {
      if (this.opacity <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.burstDone) {
        const age = time - this.burstTime;
        if (age >= 0 && age < 0.3) {
          const k = age / 0.3;
          const ringAlpha = (1 - k) * 0.9 * this.opacity;
          ctx.globalAlpha = ringAlpha;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.fontSize * 0.8 * (0.2 + k * 1.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = this.opacity;
        }
      }
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.fontSize * 0.4;
      ctx.fillStyle = this.color;
      ctx.font = `600 ${this.fontSize}px 'Montserrat', 'Helvetica Neue', Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.ch, this.x, this.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function layout() {
    const sizeFactor = Math.min(W, H);
    let baseFont;
    if (sizeFactor < 380) baseFont = 22;
    else if (sizeFactor < 420) baseFont = 26;
    else if (sizeFactor < 600) baseFont = 30;
    else if (sizeFactor < 800) baseFont = 36;
    else baseFont = 42;
    baseFont = Math.max(18, Math.min(baseFont, Math.min(W, H) * 0.07));
    const letterSpacing = baseFont * 0.9,
      lineGap = baseFont * 1.3;
    LAUNCH_X = W / 2;
    LAUNCH_Y = H + 20;
    const lines = [LINE1, LINE2];
    let centerY;
    if (H < 500) centerY = H * 0.42;
    else if (H < 700) centerY = H * 0.44;
    else centerY = H * 0.45;
    let newLetters = [];
    let idx = 0;
    lines.forEach((line, li) => {
      const chars = line.split('');
      const totalWidth = (chars.length - 1) * letterSpacing;
      const startX = W / 2 - totalWidth / 2;
      chars.forEach((ch, ci) => {
        if (ch === ' ') return;
        const color = pickColor(idx);
        const tx = startX + ci * letterSpacing;
        const ty = centerY + (li - 0.5) * lineGap;
        const letter = new Letter(ch, color, baseFont, tx, ty);
        const existing = letters.find(l => l.ch === ch && Math.abs(l._tx - tx) < 0.1 && Math.abs(l._ty - ty) < 0.1);
        if (existing) {
          letter.launchDelay = existing.launchDelay;
          letter.launchDuration = existing.launchDuration;
          letter.driftX = existing.driftX;
          letter.driftY = existing.driftY;
          letter.x = existing.x;
          letter.y = existing.y;
          letter.opacity = existing.opacity;
          letter.burstDone = existing.burstDone;
          letter.burstTime = existing.burstTime;
          letter.state = existing.state;
          letter.t = existing.t;
        }
        newLetters.push(letter);
        idx++;
      });
    });
    letters = newLetters;
  }

  function initBackground() {
    bgStars = [];
    const starCount = Math.floor((W * H) / 4000);
    for (let i = 0; i < starCount; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 1.6,
        brightness: 0.3 + Math.random() * 0.7,
        isLarge: Math.random() > 0.85
      });
    }
    glowPoints = [];
    const glowCount = Math.max(3, Math.floor(Math.min(W, H) / 200));
    for (let i = 0; i < glowCount; i++) {
      glowPoints.push({
        x: Math.random() * W,
        y: Math.random() * H,
        radius: 80 + Math.random() * 200,
        intensity: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        speed: 0.05 + Math.random() * 0.1,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6
      });
    }
  }

  function drawBackground(time) {
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
    grad.addColorStop(0, '#121218');
    grad.addColorStop(0.4, '#0c0c10');
    grad.addColorStop(0.7, '#08080a');
    grad.addColorStop(1, '#040405');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (const g of glowPoints) {
      const pulse = 0.8 + 0.2 * Math.sin(time * g.speed + g.phase);
      const r = g.radius * pulse;
      const alpha = g.intensity * (0.7 + 0.3 * Math.sin(time * g.speed * 0.7 + g.phase));
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
      grd.addColorStop(0, `rgba(180,190,220,${alpha * 0.6})`);
      grd.addColorStop(0.5, `rgba(120,140,180,${alpha * 0.3})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
      ctx.fill();
      g.x += g.dx * 0.002;
      g.y += g.dy * 0.002;
      if (g.x < -r) g.x = W + r;
      if (g.x > W + r) g.x = -r;
      if (g.y < -r) g.y = H + r;
      if (g.y > H + r) g.y = -r;
    }

    for (const s of bgStars) {
      const tw = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
      const alpha = 0.15 + tw * 0.65 * s.brightness;
      ctx.globalAlpha = alpha;
      if (s.isLarge) {
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        grd.addColorStop(0, `rgba(255,255,255,${alpha * 0.5})`);
        grd.addColorStop(0.3, `rgba(200,210,240,${alpha * 0.2})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(180,190,220,0.3)';
      ctx.shadowBlur = s.isLarge ? 8 : 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function spawnTrailParticle(x, y, color) {
    particles.push({
      type: 'trail',
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 18 + 8,
      life: 0,
      maxLife: 0.3 + Math.random() * 0.35,
      color,
      size: Math.random() * 1.6 + 0.5
    });
  }

  function spawnBurst(x, y, color) {
    const n = 16 + Math.floor(Math.random() * 14);
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 80;
      particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 12,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.6,
        color,
        size: Math.random() * 2.2 + 0.6,
        grav: 45
      });
    }
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 30;
      particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 8,
        life: 0,
        maxLife: 0.2 + Math.random() * 0.2,
        color: '#ffffff',
        size: Math.random() * 1.8 + 1.2,
        grav: 20
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }
      if (p.grav) p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.99;
      p.vy *= 0.99;
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const k = 1 - p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, k * 0.95);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let sceneTime = 0,
    lastTs = null;
  const HOLD_DURATION = 1.6;

  function maxSettleTime() {
    let m = 0;
    for (const L of letters) m = Math.max(m, L.launchDelay + L.launchDuration);
    return m;
  }

  function recycleLetters() {
    letters.forEach(L => {
      L.launchDelay = 0.1 + Math.random() * 0.45;
      L.launchDuration = 0.55 + Math.random() * 0.3;
      L.reset();
    });
    particles = [];
  }

  function frame(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    sceneTime += dt;
    const settleEnd = maxSettleTime() + HOLD_DURATION;
    if (sceneTime > settleEnd) {
      recycleLetters();
      sceneTime = 0;
    }
    const starTime = performance.now() / 1000;
    drawBackground(starTime);
    updateParticles(dt);
    for (const L of letters) L.update(dt, sceneTime);
    drawParticles();
    for (const L of letters) L.draw(sceneTime);
    requestAnimationFrame(frame);
  }

  let started = false;

  function startOnce() {
    if (started) return;
    started = true;
    layout();
    initBackground();
    letters.forEach(L => L.reset());
    particles = [];
    sceneTime = 0;
    lastTs = null;
    requestAnimationFrame(frame);
  }

  if (document.fonts && document.fonts.load) {
    document.fonts.load("600 20px 'Montserrat'").then(startOnce).catch(() => startOnce());
    setTimeout(startOnce, 500);
  } else startOnce();

  window.addEventListener('resize', () => {
    resize();
    layout();
    initBackground();
    letters.forEach(l => {
      l.tx = l._tx;
      l.ty = l._ty;
      l.fontSize = l._fontSize;
    });
  });

  // ============================================================
  // SCROLL REVEAL LOGIC
  // ============================================================
  let revealed = false,
    transitioning = false;
  const LOCK_MS = 650;

  function revealPageTwo() {
    if (revealed || transitioning) return;
    revealed = true;
    transitioning = true;
    const rocketSection = document.getElementById('rocketSection');
    rocketSection.classList.add('hidden');
    rocketSection.style.pointerEvents = 'none';
    const pageTwo = document.getElementById('pageTwo');
    pageTwo.classList.add('shown');
    document.body.classList.add('unlocked');
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pageTwo.classList.add('entered');
        window.dispatchEvent(new Event('resize'));
      });
    });
    setTimeout(() => { transitioning = false; }, LOCK_MS);
  }

  function revealRocket() {
    if (!revealed || transitioning) return;
    revealed = false;
    transitioning = true;
    const pageTwo = document.getElementById('pageTwo');
    pageTwo.classList.remove('entered');
    const rocketSection = document.getElementById('rocketSection');
    rocketSection.classList.remove('hidden');
    rocketSection.style.pointerEvents = 'auto';
    setTimeout(() => {
      pageTwo.classList.remove('shown');
      document.body.classList.remove('unlocked');
      transitioning = false;
    }, 350);
  }

  let countdownDone = false;
  const overlay = document.getElementById('countdownOverlay');

  function checkCountdownStatus() {
    if (overlay.classList.contains('hidden')) {
      countdownDone = true;
      document.body.classList.add('unlocked');
      document.getElementById('rocketSection').style.pointerEvents = 'auto';
    } else {
      countdownDone = false;
    }
  }
  checkCountdownStatus();

  const overlayObserver = new MutationObserver(() => { checkCountdownStatus(); });
  overlayObserver.observe(overlay, { attributes: true, attributeFilter: ['class'] });

  let pageTwoVisible = false;
  const pageTwoObserver = new MutationObserver(() => {
    pageTwoVisible = document.getElementById('pageTwo').classList.contains('entered');
  });
  pageTwoObserver.observe(document.getElementById('pageTwo'), { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('wheel', (e) => {
    if (!countdownDone) return;
    const rocketSection = document.getElementById('rocketSection');
    const isRocketHidden = rocketSection.classList.contains('hidden');
    if (e.deltaY > 0) {
      if (!isRocketHidden && !revealed) {
        revealPageTwo();
        e.preventDefault();
      }
    }
    if (e.deltaY < 0) {
      if (revealed && window.scrollY <= 0) {
        revealRocket();
        e.preventDefault();
      }
    }
  }, { passive: false });

  document.getElementById('scrollHint').addEventListener('click', () => {
    if (countdownDone && !revealed && !document.getElementById('rocketSection').classList.contains('hidden')) {
      revealPageTwo();
    }
  });

  let touchStartY = null;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!countdownDone) return;
    const rocketSection = document.getElementById('rocketSection');
    const isRocketHidden = rocketSection.classList.contains('hidden');
    if (touchStartY === null) return;
    const dy = touchStartY - e.touches[0].clientY;
    if (!isRocketHidden && !revealed && dy > 24) {
      revealPageTwo();
      e.preventDefault();
      return;
    }
    if (revealed && dy < -24) {
      if (window.scrollY > 0) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        revealRocket();
        e.preventDefault();
      }
    }
  }, { passive: false });

  if (overlay.classList.contains('hidden')) {
    countdownDone = true;
    document.body.classList.add('unlocked');
    document.getElementById('rocketSection').style.pointerEvents = 'auto';
  }
})();


// ============================================================
// TYPING EFFECT
// ============================================================
(function() {
  const phrases = ['Cutie', 'Sharmila', 'Gayatri', 'Chotu'];
  const el = document.getElementById('typing');
  let pi = 0,
    ci = 0,
    del = false;

  function tick() {
    const phrase = phrases[pi];
    if (!del) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        del = true;
        return setTimeout(tick, 1600);
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        del = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, del ? 52 : 110);
  }
  tick();
})();
