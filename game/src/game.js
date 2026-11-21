// Spot the Difference — The Curio Garden: game state, input, timer, scoring.
// Two canvases show the same scene; the right one carries every difference.
// A click (or the keyboard crosshair + Enter) on either picture marks a
// difference on both. Markers, timer, score, hints and level flow live here.
import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { sfx, setMuted, isMuted } from './audio.js';

const $ = (id) => document.getElementById(id);

export class Game {
  constructor() {
    this.left = $('canvas-left').getContext('2d');
    this.right = $('canvas-right').getContext('2d');
    this.levelIndex = 0;
    this.unlocked = 1;
    this.completed = new Set();
    this.totalScore = 0;
    this.state = 'title'; // title | playing | levelDone | gameOver | victory
    this.found = new Set();
    this.mistakes = 0;
    this.hintsLeft = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.timeLeft = 0;
    this.timerId = null;
    this.hintPulse = null;
    this.cross = { x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
    this.shot = new URLSearchParams(window.location.search).get('shot');
    this.levelParam = Number(new URLSearchParams(window.location.search).get('level') || 0);
    this.wrongFlash = null;
    this.bindInput();
    this.renderLevelBar();
  }

  get scene() { return SCENES[this.levelIndex]; }

  /* ---------- flow ---------- */
  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.mistakes = 0;
    this.hintsLeft = 3;
    this.combo = 0;
    this.timeLeft = this.scene.timeLimit;
    this.state = 'playing';
    this.hintPulse = null;
    this.stopTimer();
    this.timerId = window.setInterval(() => this.tick(), 1000);
    this.hideOverlay();
    this.draw();
    this.updateHud();
    this.setMessage(this.scene.intro);
    $('scene-name').textContent = `Scene ${index + 1}: ${this.scene.name}`;
    this.renderLevelBar();
  }

  tick() {
    if (this.state !== 'playing') return;
    this.timeLeft -= 1;
    if (this.timeLeft <= 10 && this.timeLeft > 0) sfx.tick();
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.updateHud();
      this.failLevel();
      return;
    }
    this.updateHud();
  }

  stopTimer() {
    if (this.timerId !== null) { window.clearInterval(this.timerId); this.timerId = null; }
  }

  failLevel() {
    this.stopTimer();
    this.state = 'gameOver';
    sfx.gameOver();
    this.showOverlay(`
      <div class="overlay-card">
        <div class="big">&#9200;</div>
        <h2>Out of time!</h2>
        <p>You found <b>${this.found.size} of ${this.scene.diffs.length}</b> differences in “${this.scene.name}”.</p>
        <p>Take another look — the differences are still hiding there.</p>
        <div class="actions">
          <button type="button" data-action="retry">Try again</button>
          <button type="button" class="secondary" data-action="title">Back to title</button>
        </div>
      </div>`);
  }

  completeLevel() {
    this.stopTimer();
    this.state = 'levelDone';
    const timeBonus = this.timeLeft * 5;
    const mistakePenalty = this.mistakes * 25;
    const levelScore = Math.max(0, 700 + timeBonus - mistakePenalty + this.bestCombo * 20);
    this.totalScore += levelScore;
    this.completed.add(this.levelIndex);
    this.unlocked = Math.min(SCENES.length, Math.max(this.unlocked, this.levelIndex + 2));
    const stars = this.mistakes === 0 && this.timeLeft > 60 ? 3 : this.mistakes <= 2 ? 2 : 1;
    const last = this.levelIndex === SCENES.length - 1;
    sfx.levelWin();
    this.draw();
    this.updateHud();
    this.showOverlay(`
      <div class="overlay-card">
        <div class="big">&#127942;</div>
        <h2>${last ? 'You did it!' : 'Level complete!'}</h2>
        <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <p class="score-line">Level score: ${levelScore} &nbsp;·&nbsp; Total: ${this.totalScore}</p>
        <p>All ${this.scene.diffs.length} differences found in “${this.scene.name}” with ${this.mistakes} miss${this.mistakes === 1 ? '' : 'es'} and ${this.timeLeft}s to spare.</p>
        <div class="actions">
          ${last
            ? '<button type="button" data-action="victory">See your results</button>'
            : '<button type="button" data-action="next">Next scene &rarr;</button>'}
          <button type="button" class="secondary" data-action="replay">Replay scene</button>
        </div>
      </div>`);
    if (last) this.state = 'victoryPending';
  }

  showVictory() {
    this.state = 'victory';
    sfx.gameWin();
    this.showOverlay(`
      <div class="overlay-card">
        <div class="big">&#127881;</div>
        <h2>Master Spotter!</h2>
        <div class="stars">★★★</div>
        <p class="score-line">Final score: ${this.totalScore}</p>
        <p>You found every difference in all five scenes of The Curio Garden — the garden, the kitchen, the deep sea, the campsite and the toy workshop. No detail escapes you.</p>
        <div class="actions">
          <button type="button" data-action="again">Play again</button>
          <button type="button" class="secondary" data-action="title">Back to title</button>
        </div>
        <p class="tiny">Tip: press <kbd>1</kbd>–<kbd>5</kbd> on the title screen to jump to any scene you have unlocked.</p>
      </div>`);
  }

  showTitle() {
    this.stopTimer();
    this.state = 'title';
    this.levelIndex = 0;
    this.found = new Set();
    this.timeLeft = SCENES[0].timeLimit;
    this.hintsLeft = 3;
    this.draw();
    this.updateHud();
    $('scene-name').textContent = 'Five scenes · 35 differences to find';
    this.setMessage('Welcome, sharp eyes! Pick a scene below or press Start and find every difference.');
    this.showOverlay(`
      <div class="overlay-card">
        <div class="big">&#128269;</div>
        <h2>Spot the Difference</h2>
        <p><b>The Curio Garden</b> — five hand-drawn scenes, seven hidden differences in each.</p>
        <p>Two pictures sit side by side. They look the same… but they are not. Click every difference on either picture before the clock runs out.</p>
        <p class="tiny">Click a difference &middot; Arrow keys move the crosshair, <kbd>Enter</kbd> checks it &middot; <kbd>H</kbd> hint &middot; wrong clicks cost 5 seconds</p>
        <div class="actions">
          <button type="button" data-action="start">Start playing</button>
        </div>
      </div>`);
    this.renderLevelBar();
  }

  /* ---------- input ---------- */
  bindInput() {
    const toScene = (event, canvas) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
        y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
      };
    };
    $('canvas-left').addEventListener('click', (e) => this.checkAt(toScene(e, $('canvas-left'))));
    $('canvas-right').addEventListener('click', (e) => this.checkAt(toScene(e, $('canvas-right'))));
    $('canvas-left').addEventListener('mousemove', (e) => this.moveCross(toScene(e, $('canvas-left'))));
    $('canvas-right').addEventListener('mousemove', (e) => this.moveCross(toScene(e, $('canvas-right'))));
    $('btn-hint').addEventListener('click', () => this.useHint());
    $('btn-sound').addEventListener('click', () => this.toggleSound());
    document.addEventListener('keydown', (e) => this.onKey(e));
    $('overlay').addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      sfx.click();
      this.doAction(action);
    });
    $('level-bar').addEventListener('click', (e) => {
      const pill = e.target.closest('.level-pill');
      if (!pill || pill.classList.contains('locked')) return;
      sfx.click();
      this.startLevel(Number(pill.dataset.level));
    });
  }

  doAction(action) {
    if (action === 'start') this.startLevel(0);
    else if (action === 'next') this.startLevel(this.levelIndex + 1);
    else if (action === 'retry' || action === 'replay') this.startLevel(this.levelIndex);
    else if (action === 'victory') this.showVictory();
    else if (action === 'again') { this.totalScore = 0; this.completed.clear(); this.unlocked = 1; this.startLevel(0); }
    else if (action === 'title') this.showTitle();
  }

  onKey(e) {
    if (this.state === 'playing') {
      const step = e.shiftKey ? 60 : 24;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.cross.visible = true;
        if (e.key === 'ArrowLeft') this.cross.x = Math.max(0, this.cross.x - step);
        if (e.key === 'ArrowRight') this.cross.x = Math.min(PANEL_W, this.cross.x + step);
        if (e.key === 'ArrowUp') this.cross.y = Math.max(0, this.cross.y - step);
        if (e.key === 'ArrowDown') this.cross.y = Math.min(PANEL_H, this.cross.y + step);
        this.draw();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.cross.visible = true; this.checkAt({ x: this.cross.x, y: this.cross.y }); return; }
      if (e.key === 'h' || e.key === 'H') { this.useHint(); return; }
      if (e.key === 'r' || e.key === 'R') { this.startLevel(this.levelIndex); return; }
    }
    if (e.key === 'm' || e.key === 'M') { this.toggleSound(); return; }
    if (this.state === 'title' && /^[1-5]$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (idx < this.unlocked) this.startLevel(idx);
    }
  }

  moveCross(pos) {
    if (this.state !== 'playing') return;
    this.cross = { ...pos, visible: false };
  }

  checkAt(pos) {
    if (this.state !== 'playing') return;
    const hit = this.scene.diffs.find((d) => !this.found.has(d.id) && Math.hypot(d.x - pos.x, d.y - pos.y) <= d.r + 14);
    if (hit) {
      this.found.add(hit.id);
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const gained = 100 + (this.combo - 1) * 25;
      this.totalScore += gained;
      sfx.correct();
      this.setMessage(`Found it! +${gained} points. ${this.scene.diffs.length - this.found.size} left.`, 'good');
      if (this.combo >= 2) {
        const comboEl = $('combo');
        comboEl.hidden = false;
        comboEl.textContent = `Combo ×${this.combo}!`;
      }
      this.draw();
      this.updateHud();
      if (this.found.size === this.scene.diffs.length) this.completeLevel();
    } else {
      this.mistakes += 1;
      this.combo = 0;
      $('combo').hidden = true;
      this.timeLeft = Math.max(0, this.timeLeft - 5);
      this.wrongFlash = { x: pos.x, y: pos.y, until: Date.now() + 450 };
      sfx.wrong();
      this.setMessage('Not quite — that costs 5 seconds. Look closer!', 'bad');
      this.draw();
      this.updateHud();
      window.setTimeout(() => { this.wrongFlash = null; this.draw(); }, 500);
    }
  }

  useHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) { this.setMessage('No hints left in this scene.', 'bad'); return; }
    const remaining = this.scene.diffs.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    this.hintsLeft -= 1;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintPulse = { ...pick, until: Date.now() + 2200 };
    sfx.hint();
    this.setMessage(`Hint: ${pick.hint}`, 'good');
    this.draw();
    this.updateHud();
    window.setTimeout(() => { this.hintPulse = null; this.draw(); }, 2300);
  }

  toggleSound() {
    setMuted(!isMuted());
    $('btn-sound').innerHTML = isMuted() ? '&#128263; Muted' : '&#128266; Sound';
    if (!isMuted()) sfx.click();
  }

  /* ---------- rendering ---------- */
  draw() {
    const leftVariant = new Set();
    const rightVariant = new Set(this.scene.diffs.map((d) => d.id));
    this.scene.draw(this.left, leftVariant);
    this.scene.draw(this.right, rightVariant);
    this.drawMarks(this.left);
    this.drawMarks(this.right);
    if (this.hintPulse && Date.now() < this.hintPulse.until) {
      [this.left, this.right].forEach((ctx) => this.ring(ctx, this.hintPulse, '#ffb703', 3 + Math.sin(Date.now() / 120) * 2));
    }
    if (this.wrongFlash && Date.now() < this.wrongFlash.until) {
      [this.left, this.right].forEach((ctx) => this.drawX(ctx, this.wrongFlash));
    }
    if (this.cross.visible && this.state === 'playing') {
      const cl = $('cross-left'); const cr = $('cross-right');
      cl.hidden = false; cr.hidden = false;
      const pctX = `${(this.cross.x / PANEL_W) * 100}%`;
      const pctY = `${(this.cross.y / PANEL_H) * 100}%`;
      cl.style.left = pctX; cl.style.top = pctY;
      cr.style.left = pctX; cr.style.top = pctY;
    } else {
      $('cross-left').hidden = true;
      $('cross-right').hidden = true;
    }
  }

  drawMarks(ctx) {
    this.scene.diffs.forEach((d) => {
      if (this.found.has(d.id)) this.ring(ctx, d, '#e63946', 0);
    });
  }

  ring(ctx, d, color, wobble) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.r + 6 + (wobble || 0), (d.r + 6 + (wobble || 0)) * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawX(ctx, p) {
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x - 12, p.y - 12); ctx.lineTo(p.x + 12, p.y + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.x + 12, p.y - 12); ctx.lineTo(p.x - 12, p.y + 12); ctx.stroke();
  }

  updateHud() {
    $('hud-level').textContent = `${this.levelIndex + 1} / ${SCENES.length}`;
    $('hud-found').textContent = `${this.found.size} / ${this.scene.diffs.length}`;
    $('hud-left').textContent = String(this.scene.diffs.length - this.found.size);
    $('hud-score').textContent = String(this.totalScore);
    const timeEl = $('hud-time');
    timeEl.textContent = `${Math.floor(this.timeLeft / 60)}:${String(this.timeLeft % 60).padStart(2, '0')}`;
    timeEl.classList.toggle('low', this.timeLeft <= 15 && this.state === 'playing');
    $('hud-hints').textContent = String(this.hintsLeft);
    $('btn-hint').disabled = this.state !== 'playing' || this.hintsLeft <= 0;
  }

  setMessage(text, kind) {
    const bar = $('message-bar');
    $('message').textContent = text;
    bar.classList.toggle('good', kind === 'good');
    bar.classList.toggle('bad', kind === 'bad');
  }

  renderLevelBar() {
    $('level-bar').innerHTML = SCENES.map((s, i) => {
      const cls = ['level-pill'];
      if (i === this.levelIndex && this.state !== 'title') cls.push('current');
      if (this.completed.has(i)) cls.push('done');
      if (i >= this.unlocked) cls.push('locked');
      const mark = this.completed.has(i) ? ' ✓' : i >= this.unlocked ? ' 🔒' : '';
      return `<button type="button" class="${cls.join(' ')}" data-level="${i}">${i + 1}. ${s.name}${mark}</button>`;
    }).join('');
  }

  showOverlay(html) {
    const ov = $('overlay');
    ov.innerHTML = html;
    ov.hidden = false;
  }

  hideOverlay() { $('overlay').hidden = true; $('overlay').innerHTML = ''; }

  /* ---------- deterministic screenshot scenes (?shot=) ---------- */
  applyShot() {
    if (this.shot === 'start') {
      this.showTitle();
      return;
    }
    if (this.shot === 'play') {
      // Level 3 (Deep Sea), mid-game: 3 found, 4 still hidden, counter visible.
      this.levelIndex = 2;
      this.totalScore = 350;
      this.found = new Set(['fish-extra', 'bubbles', 'starfish']);
      this.mistakes = 1;
      this.hintsLeft = 2;
      this.timeLeft = 97;
      this.state = 'playing';
      this.stopTimer();
      this.hideOverlay();
      this.draw();
      this.updateHud();
      $('scene-name').textContent = 'Scene 3: Deep Sea';
      this.setMessage('3 found, 4 still hiding — look closely at the coral and the chest…', 'good');
      $('combo').hidden = false;
      $('combo').textContent = 'Combo ×3!';
      this.renderLevelBar();
      return;
    }
    if (this.shot === 'end') {
      this.levelIndex = 4;
      this.completed = new Set([0, 1, 2, 3, 4]);
      this.unlocked = 5;
      this.totalScore = 4740;
      this.found = new Set(SCENES[4].diffs.map((d) => d.id));
      this.timeLeft = 74;
      this.mistakes = 1;
      this.state = 'playing';
      this.draw();
      this.updateHud();
      $('scene-name').textContent = 'Scene 5: Toy Workshop';
      this.showVictory();
      this.renderLevelBar();
      return;
    }
    this.showTitle();
  }
}
