// The Curio Garden — five original scenes, drawn procedurally on canvas.
// Each scene draws itself twice: once plain (Picture A) and once with every
// difference applied (Picture B). A difference is a small conditional in the
// drawing code, so both pictures come from the same hand-drawn art.
export const PANEL_W = 640;
export const PANEL_H = 460;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function star(ctx, x, y, r, fill, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function flower(ctx, x, y, petalColor, centerColor, missingPetal) {
  for (let i = 0; i < 6; i += 1) {
    if (missingPetal && i === 2) continue;
    const a = (i * Math.PI) / 3;
    ellipse(ctx, x + Math.cos(a) * 13, y + Math.sin(a) * 13, 10, 7, petalColor);
  }
  circle(ctx, x, y, 9, centerColor);
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x, y + 42);
  ctx.stroke();
}

function pineTree(ctx, x, y, scale, ornament) {
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(x - 5 * scale, y, 10 * scale, 18 * scale);
  ctx.fillStyle = '#2e7d32';
  for (let i = 0; i < 3; i += 1) {
    const w = (56 - i * 13) * scale;
    const top = y - i * 26 * scale;
    ctx.beginPath();
    ctx.moveTo(x, top - 30 * scale);
    ctx.lineTo(x - w / 2, top + 8 * scale);
    ctx.lineTo(x + w / 2, top + 8 * scale);
    ctx.closePath();
    ctx.fill();
  }
  if (ornament) {
    circle(ctx, x - 12 * scale, y - 34 * scale, 4.5 * scale, '#e63946');
    circle(ctx, x + 10 * scale, y - 52 * scale, 4.5 * scale, '#ffb703');
  }
}

/* ---------------- Scene 1: Sunny Garden ---------------- */
function drawGarden(ctx, v) {
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(0.62, '#cfeefb');
  sky.addColorStop(0.62, '#8bc34a');
  sky.addColorStop(1, '#689f38');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);

  // Sun (top left)
  circle(ctx, 100, 82, 42, '#ffdf3d');
  ctx.strokeStyle = '#ffdf3d';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(100 + Math.cos(a) * 52, 82 + Math.sin(a) * 52);
    ctx.lineTo(100 + Math.cos(a) * 66, 82 + Math.sin(a) * 66);
    ctx.stroke();
  }
  circle(ctx, 88, 76, 5, '#7a4a12');
  circle(ctx, 112, 76, 5, '#7a4a12');
  ctx.strokeStyle = '#7a4a12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(100, 88, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (v.has('sun-glasses')) {
    ctx.fillStyle = '#222';
    rr(ctx, 74, 66, 26, 16, 6); ctx.fill();
    rr(ctx, 100, 66, 26, 16, 6); ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(100, 72); ctx.lineTo(100, 72); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100, 74); ctx.lineTo(100, 74); ctx.stroke();
  }
  // Clouds
  const cloud = (x, y, s) => {
    ctx.fillStyle = '#ffffff';
    circle(ctx, x, y, 18 * s, '#ffffff');
    circle(ctx, x + 20 * s, y - 6 * s, 22 * s, '#ffffff');
    circle(ctx, x + 44 * s, y, 17 * s, '#ffffff');
    ctx.fillRect(x - 16 * s, y, 76 * s, 16 * s);
  };
  cloud(300, 60, 1);
  cloud(520, 130, 0.8);
  if (v.has('cloud-extra')) cloud(470, 48, 0.55);

  // Fence
  ctx.fillStyle = '#d7a86e';
  ctx.fillRect(0, 318, PANEL_W, 10);
  ctx.fillRect(0, 348, PANEL_W, 10);
  for (let x = 20; x < PANEL_W; x += 52) {
    const boardColor = v.has('fence-board') && x === 332 ? '#c0392b' : '#e8c99a';
    ctx.fillStyle = boardColor;
    ctx.fillRect(x, 300, 34, 74);
    ctx.beginPath();
    ctx.moveTo(x, 300); ctx.lineTo(x + 17, 286); ctx.lineTo(x + 34, 300);
    ctx.closePath();
    ctx.fill();
  }

  // Tree (right)
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(556, 210, 26, 110);
  circle(ctx, 569, 190, 52, '#43a047');
  circle(ctx, 528, 214, 36, '#66bb6a');
  circle(ctx, 610, 214, 36, '#388e3c');
  circle(ctx, 596, 168, 24, '#e53935');
  circle(ctx, 540, 176, 20, '#e53935');

  // Flowers
  flower(ctx, 80, 400, '#ff6b9d', '#ffdf3d', false);
  flower(ctx, 200, 408, '#ba68c8', '#ffdf3d', v.has('flower-petal'));
  flower(ctx, 330, 398, '#ff8a65', '#fff176', false);
  flower(ctx, 470, 406, '#4fc3f7', '#fff176', false);

  // Mushroom
  ctx.fillStyle = '#fff8e1';
  rr(ctx, 588, 392, 22, 34, 6); ctx.fill();
  ctx.fillStyle = '#e53935';
  ctx.beginPath(); ctx.arc(599, 394, 30, Math.PI, 0); ctx.closePath(); ctx.fill();
  const spots = v.has('mushroom-spots') ? 3 : 4;
  circle(ctx, 584, 378, 5, '#fff');
  circle(ctx, 600, 368, 5, '#fff');
  circle(ctx, 614, 380, 5, '#fff');
  if (spots === 4) circle(ctx, 599, 386, 4, '#fff');

  // Bee
  const bx = 430; const by = 150;
  ellipse(ctx, bx, by, 20, 13, '#ffcf3f');
  ctx.fillStyle = '#222';
  ctx.fillRect(bx - 8, by - 12, 5, 24);
  ctx.fillRect(bx + 2, by - 12, 5, 24);
  if (v.has('bee-stripes')) ctx.fillRect(bx + 11, by - 10, 4, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ellipse(ctx, bx - 2, by - 18, 10, 6, 'rgba(255,255,255,0.85)');
  ellipse(ctx, bx + 8, by - 18, 9, 5, 'rgba(255,255,255,0.85)');

  // Butterfly
  const fx = 520; const fy = 110;
  ctx.fillStyle = '#ab47bc';
  ellipse(ctx, fx - 12, fy - 10, 13, 10, '#ab47bc');
  ellipse(ctx, fx + 12, fy - 10, 13, 10, '#ab47bc');
  ellipse(ctx, fx - 10, fy + 10, 10, 8, '#ce93d8');
  ellipse(ctx, fx + 10, fy + 10, 10, 8, '#ce93d8');
  if (!v.has('butterfly-spot')) circle(ctx, fx - 12, fy - 10, 4, '#fff176');
  ctx.strokeStyle = '#4a148c';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(fx, fy - 8); ctx.lineTo(fx, fy + 12); ctx.stroke();
}

/* ---------------- Scene 2: Cozy Kitchen ---------------- */
function drawKitchen(ctx, v) {
  ctx.fillStyle = '#ffe0b2';
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  ctx.fillStyle = '#ffcc80';
  ctx.fillRect(0, 300, PANEL_W, 160);
  // Window
  ctx.fillStyle = '#fff';
  rr(ctx, 120, 40, 180, 150, 8); ctx.fill();
  const winSky = ctx.createLinearGradient(0, 50, 0, 180);
  winSky.addColorStop(0, '#7ec8f2'); winSky.addColorStop(1, '#dff3ff');
  ctx.fillStyle = winSky;
  ctx.fillRect(130, 50, 160, 130);
  circle(ctx, 160, 80, 18, '#ffdf3d');
  if (v.has('window-bird')) {
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(250, 100, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(268, 100, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(205, 50, 10, 130);
  ctx.fillRect(130, 110, 160, 10);
  // Curtains
  ctx.fillStyle = '#ef5350';
  ctx.fillRect(112, 34, 26, 162);
  ctx.fillRect(282, 34, 26, 162);
  // Clock
  circle(ctx, 520, 92, 44, '#fffdf5');
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(520, 92, 44, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(520, 92); ctx.lineTo(520, 62); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(520, 92);
  if (v.has('clock-time')) ctx.lineTo(496, 106); else ctx.lineTo(548, 92);
  ctx.stroke();
  circle(ctx, 520, 92, 4, '#333');
  // Shelf with jars
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(380, 190, 220, 12);
  const jar = (x, label) => {
    ctx.fillStyle = '#b2dfdb';
    rr(ctx, x, 140, 44, 50, 6); ctx.fill();
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(x + 6, 132, 32, 10);
    if (label) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 10, 158, 24, 18);
      star(ctx, x + 22, 167, 6, '#ffb703');
    }
  };
  jar(400, true);
  jar(462, v.has('jar-label'));
  jar(524, true);
  // Table
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(60, 330, 520, 16);
  ctx.fillRect(90, 346, 18, 90);
  ctx.fillRect(532, 346, 18, 90);
  // Teapot
  ctx.fillStyle = '#7e57c2';
  ellipse(ctx, 300, 300, 52, 36, '#7e57c2');
  ctx.beginPath(); ctx.moveTo(348, 290); ctx.quadraticCurveTo(382, 280, 372, 306); ctx.quadraticCurveTo(360, 316, 346, 306); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5e35b1';
  rr(ctx, 288, 252, 24, 14, 6); ctx.fill();
  ctx.fillStyle = '#b39ddb';
  ellipse(ctx, 300, 296, 34, 20, '#b39ddb');
  if (!v.has('teapot-steam')) {
    ctx.strokeStyle = 'rgba(120,120,120,0.7)';
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(296, 244); ctx.quadraticCurveTo(288, 224, 296, 206); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(312, 244); ctx.quadraticCurveTo(320, 226, 312, 210); ctx.stroke();
  }
  // Fruit bowl
  ctx.fillStyle = '#eceff1';
  ctx.beginPath(); ctx.ellipse(150, 322, 62, 18, 0, 0, Math.PI); ctx.fill();
  const apple = (x, y) => { circle(ctx, x, y, 15, '#e53935'); ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 4, y - 22); ctx.stroke(); };
  apple(118, 306); apple(150, 300);
  if (v.has('fruit-count')) { circle(ctx, 182, 306, 15, '#fb8c00'); } else { apple(182, 306); }
  // Mug
  ctx.fillStyle = v.has('mug-color') ? '#43a047' : '#e53935';
  rr(ctx, 452, 288, 46, 40, 6); ctx.fill();
  ctx.strokeStyle = v.has('mug-color') ? '#43a047' : '#e53935';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(500, 308, 12, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  // Cat on rug
  ellipse(ctx, 420, 408, 62, 26, '#ffcc80');
  ellipse(ctx, 420, 392, 40, 26, '#ffcc80');
  circle(ctx, 384, 372, 18, '#ffcc80');
  ctx.fillStyle = '#ffcc80';
  ctx.beginPath(); ctx.moveTo(372, 362); ctx.lineTo(368, 344); ctx.lineTo(380, 358); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(392, 358); ctx.lineTo(398, 342); ctx.lineTo(402, 360); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(378, 370); ctx.lineTo(384, 370); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(390, 370); ctx.lineTo(396, 370); ctx.stroke();
  if (!v.has('cat-bow')) {
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(384, 392); ctx.lineTo(372, 386); ctx.lineTo(372, 398); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(384, 392); ctx.lineTo(396, 386); ctx.lineTo(396, 398); ctx.closePath(); ctx.fill();
    circle(ctx, 384, 392, 4, '#b71c1c');
  }
  // Rug
  ctx.fillStyle = '#ef9a9a';
  rr(ctx, 330, 428, 200, 22, 8); ctx.fill();
  ctx.fillStyle = '#ffcdd2';
  ctx.fillRect(350, 428, 20, 22);
  ctx.fillRect(420, 428, 20, 22);
  ctx.fillRect(490, 428, 20, 22);
}

/* ---------------- Scene 3: Deep Sea ---------------- */
function drawSea(ctx, v) {
  const water = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  water.addColorStop(0, '#1565c0');
  water.addColorStop(0.6, '#1e88e5');
  water.addColorStop(1, '#0d47a1');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Light rays
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(200, 0); ctx.lineTo(120, 460); ctx.lineTo(40, 460); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(430, 0); ctx.lineTo(360, 460); ctx.lineTo(300, 460); ctx.closePath(); ctx.fill();
  // Sand
  ctx.fillStyle = '#e6c98f';
  ctx.beginPath(); ctx.moveTo(0, 400); ctx.quadraticCurveTo(320, 370, 640, 405); ctx.lineTo(640, 460); ctx.lineTo(0, 460); ctx.closePath(); ctx.fill();
  // Coral (left)
  ctx.strokeStyle = '#ff7043';
  ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(90, 400); ctx.quadraticCurveTo(80, 330, 96, 290); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(92, 340); ctx.quadraticCurveTo(60, 320, 52, 292); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(94, 330); ctx.quadraticCurveTo(126, 306, 132, 278); ctx.stroke();
  if (!v.has('coral-branch')) {
    ctx.beginPath(); ctx.moveTo(94, 312); ctx.quadraticCurveTo(70, 288, 62, 262); ctx.stroke();
  }
  ctx.fillStyle = '#ff8a65';
  circle(ctx, 96, 288, 8, '#ff8a65');
  circle(ctx, 52, 290, 8, '#ff8a65');
  circle(ctx, 132, 276, 8, '#ff8a65');
  // Starfish
  if (!v.has('starfish')) star(ctx, 150, 424, 22, '#ff7043');
  // Treasure chest
  ctx.fillStyle = '#6d4c41';
  rr(ctx, 400, 360, 110, 52, 8); ctx.fill();
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath(); ctx.ellipse(455, 360, 55, 26, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#ffb703';
  ctx.fillRect(448, 356, 14, 14);
  const gems = v.has('chest-gems') ? 5 : 3;
  circle(ctx, 428, 348, 6, '#e53935');
  circle(ctx, 455, 342, 6, '#4fc3f7');
  circle(ctx, 482, 348, 6, '#66bb6a');
  if (gems === 5) { circle(ctx, 414, 352, 5, '#ab47bc'); circle(ctx, 496, 352, 5, '#ffca28'); }
  // Octopus (right)
  const ox = 530; const oy = 250;
  ctx.strokeStyle = '#ab47bc';
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  const arms = v.has('octopus-arms') ? 7 : 8;
  for (let i = 0; i < arms; i += 1) {
    const spread = (i - (arms - 1) / 2) * 13;
    ctx.beginPath();
    ctx.moveTo(ox + spread * 0.4, oy + 18);
    ctx.quadraticCurveTo(ox + spread, oy + 48, ox + spread * 1.15, oy + 74);
    ctx.stroke();
  }
  ctx.fillStyle = '#ab47bc';
  ctx.beginPath(); ctx.ellipse(ox, oy, 34, 30, 0, 0, Math.PI * 2); ctx.fill();
  circle(ctx, ox - 12, oy - 6, 5, '#fff');
  circle(ctx, ox + 12, oy - 6, 5, '#fff');
  circle(ctx, ox - 12, oy - 6, 2.5, '#222');
  circle(ctx, ox + 12, oy - 6, 2.5, '#222');
  // Fish
  const fish = (x, y, s, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y, 26 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 22 * s, y); ctx.lineTo(x - 38 * s, y - 12 * s); ctx.lineTo(x - 38 * s, y + 12 * s); ctx.closePath(); ctx.fill();
    circle(ctx, x + 12 * s, y - 3 * s, 3, '#222');
  };
  fish(300, 120, 1, '#ffca28');
  fish(240, 170, 0.8, '#ff8a65');
  fish(360, 190, 0.7, '#ffca28');
  if (v.has('fish-extra')) fish(180, 100, 0.6, '#4dd0e1');
  // Seahorse
  if (v.has('seahorse')) {
    ctx.strokeStyle = '#ffb74d'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(350, 340); ctx.quadraticCurveTo(330, 320, 344, 296); ctx.quadraticCurveTo(352, 282, 342, 272); ctx.stroke();
    circle(ctx, 340, 266, 9, '#ffb74d');
    ctx.beginPath(); ctx.moveTo(348, 262); ctx.lineTo(358, 256); ctx.lineTo(350, 270); ctx.closePath(); ctx.fill();
  }
  // Bubbles
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  const bubble = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); };
  bubble(200, 200, 7); bubble(212, 178, 5); bubble(196, 158, 4);
  if (v.has('bubbles')) { bubble(224, 156, 6); bubble(232, 134, 4); bubble(214, 112, 5); }
  bubble(560, 120, 6); bubble(574, 96, 4);
}

/* ---------------- Scene 4: Starry Campsite ---------------- */
function drawCamp(ctx, v) {
  const night = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  night.addColorStop(0, '#0d1b3e');
  night.addColorStop(0.7, '#1a2f5e');
  night.addColorStop(1, '#274472');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Stars
  const starSpots = [[60, 60], [140, 40], [220, 80], [330, 46], [420, 70], [90, 130], [250, 130], [470, 120], [580, 150], [180, 170], [380, 150], [40, 210], [600, 60], [300, 100]];
  starSpots.forEach(([x, y], i) => {
    if (v.has('shooting-star') && i === 3) return;
    star(ctx, x, y, i % 3 === 0 ? 7 : 5, '#fffde7');
  });
  if (v.has('shooting-star')) {
    ctx.strokeStyle = '#fffde7'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(330, 46); ctx.lineTo(380, 80); ctx.stroke();
    star(ctx, 384, 83, 7, '#fffde7');
  }
  // Moon
  circle(ctx, 540, 82, 40, '#fff8dc');
  circle(ctx, 528, 72, 8, '#e8dcc0');
  circle(ctx, 552, 92, 6, '#e8dcc0');
  if (v.has('moon-crater')) circle(ctx, 546, 66, 6, '#e8dcc0');
  // Ground
  ctx.fillStyle = '#2e4a2f';
  ctx.beginPath(); ctx.moveTo(0, 380); ctx.quadraticCurveTo(320, 350, 640, 382); ctx.lineTo(640, 460); ctx.lineTo(0, 460); ctx.closePath(); ctx.fill();
  // Pines
  pineTree(ctx, 90, 330, 1.1, v.has('pine-ornament'));
  pineTree(ctx, 580, 340, 0.9, false);
  pineTree(ctx, 150, 350, 0.7, false);
  // Tent
  ctx.fillStyle = '#e64a19';
  ctx.beginPath(); ctx.moveTo(240, 380); ctx.lineTo(320, 220); ctx.lineTo(400, 380); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#bf360c';
  ctx.beginPath(); ctx.moveTo(320, 220); ctx.lineTo(400, 380); ctx.lineTo(320, 380); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.beginPath(); ctx.moveTo(300, 380); ctx.lineTo(320, 300); ctx.lineTo(340, 380); ctx.closePath(); ctx.fill();
  if (v.has('tent-flag')) {
    ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(320, 220); ctx.lineTo(320, 188); ctx.stroke();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.moveTo(320, 188); ctx.lineTo(344, 196); ctx.lineTo(320, 204); ctx.closePath(); ctx.fill();
  }
  // Campfire
  ctx.fillStyle = '#6d4c41';
  ctx.beginPath(); ctx.moveTo(300, 420); ctx.lineTo(340, 420); ctx.lineTo(320, 400); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(296, 428); ctx.lineTo(344, 408); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(344, 428); ctx.lineTo(296, 408); ctx.stroke();
  ctx.fillStyle = '#ff9800';
  ctx.beginPath(); ctx.moveTo(320, 396); ctx.quadraticCurveTo(300, 372, 312, 348); ctx.quadraticCurveTo(320, 368, 328, 348); ctx.quadraticCurveTo(340, 372, 320, 396); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff5722';
  ctx.beginPath(); ctx.moveTo(320, 396); ctx.quadraticCurveTo(308, 380, 316, 362); ctx.quadraticCurveTo(322, 376, 328, 362); ctx.quadraticCurveTo(332, 380, 320, 396); ctx.closePath(); ctx.fill();
  if (v.has('fire-flame')) {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath(); ctx.moveTo(320, 392); ctx.quadraticCurveTo(312, 380, 318, 366); ctx.quadraticCurveTo(324, 378, 328, 366); ctx.quadraticCurveTo(330, 380, 320, 392); ctx.closePath(); ctx.fill();
  }
  // Marshmallow stick
  ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(360, 430); ctx.lineTo(392, 380); ctx.stroke();
  circle(ctx, 394, 376, 8, '#fff');
  circle(ctx, 394, 376, 8, '#fff');
  // Lantern
  ctx.fillStyle = '#37474f';
  rr(ctx, 470, 330, 34, 46, 6); ctx.fill();
  ctx.fillStyle = v.has('lantern-moth') ? '#fff176' : '#ffe082';
  rr(ctx, 476, 338, 22, 30, 4); ctx.fill();
  ctx.strokeStyle = '#37474f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(487, 328, 10, Math.PI, 0); ctx.stroke();
  if (v.has('lantern-moth')) {
    ctx.fillStyle = '#8d6e63';
    ellipse(ctx, 516, 348, 7, 5, '#8d6e63');
    ellipse(ctx, 512, 340, 8, 4, 'rgba(255,255,255,0.8)');
    ellipse(ctx, 520, 340, 8, 4, 'rgba(255,255,255,0.8)');
  }
  // Boots
  if (v.has('boots')) {
    ctx.fillStyle = '#5d4037';
    rr(ctx, 420, 392, 20, 26, 5); ctx.fill();
    ctx.fillRect(420, 408, 32, 10);
    rr(ctx, 446, 392, 20, 26, 5); ctx.fill();
    ctx.fillRect(446, 408, 32, 10);
  }
}

/* ---------------- Scene 5: Toy Workshop ---------------- */
function drawWorkshop(ctx, v) {
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  ctx.fillStyle = '#e8d5a8';
  ctx.fillRect(0, 360, PANEL_W, 100);
  // Window
  ctx.fillStyle = '#fff';
  rr(ctx, 420, 40, 170, 130, 8); ctx.fill();
  const wsky = ctx.createLinearGradient(0, 50, 0, 160);
  wsky.addColorStop(0, '#81d4fa'); wsky.addColorStop(1, '#e1f5fe');
  ctx.fillStyle = wsky;
  ctx.fillRect(430, 50, 150, 110);
  circle(ctx, 460, 78, 16, '#ffdf3d');
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(500, 50, 8, 110);
  ctx.fillRect(430, 100, 150, 8);
  // Wall gear
  ctx.fillStyle = '#90a4ae';
  circle(ctx, 520, 300, 30, '#90a4ae');
  circle(ctx, 520, 300, 16, '#eceff1');
  const teeth = v.has('gear-teeth') ? 6 : 8;
  for (let i = 0; i < teeth; i += 1) {
    const a = (i * Math.PI * 2) / teeth;
    ctx.fillStyle = '#90a4ae';
    ctx.save();
    ctx.translate(520, 300);
    ctx.rotate(a);
    ctx.fillRect(-5, -42, 10, 14);
    ctx.restore();
  }
  circle(ctx, 520, 300, 5, '#546e7a');
  // Bookshelf
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(60, 90, 240, 240);
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(72, 102, 216, 96);
  ctx.fillRect(72, 216, 216, 96);
  const bookColors = ['#e53935', '#1e88e5', '#43a047', '#ffb703', '#ab47bc', '#ff7043'];
  bookColors.forEach((c, i) => {
    const col = v.has('book-color') && i === 2 ? '#00897b' : c;
    ctx.fillStyle = col;
    ctx.fillRect(80 + i * 30, 122 + (i % 2) * 8, 24, 76 - (i % 2) * 8);
  });
  // Globe
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(118, 300, 8, 24);
  ellipse(ctx, 122, 326, 26, 6, '#5d4037');
  ctx.save();
  ctx.translate(122, 268);
  ctx.rotate(v.has('globe-tilt') ? -0.35 : 0.12);
  circle(ctx, 0, 0, 34, '#4fc3f7');
  ctx.fillStyle = '#66bb6a';
  ctx.beginPath(); ctx.ellipse(-8, -8, 14, 9, 0.4, 0, Math.PI * 2); ctx.fill();
  if (v.has('globe-tilt')) {
    ctx.beginPath(); ctx.ellipse(12, 12, 12, 8, -0.3, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(10, -12, 10, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Rocket toy
  const rx = 480; const ry = 180;
  ctx.fillStyle = '#eceff1';
  ctx.beginPath(); ctx.ellipse(rx, ry, 22, 42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e53935';
  ctx.beginPath(); ctx.moveTo(rx - 22, ry - 10); ctx.lineTo(rx - 22, ry + 30); ctx.lineTo(rx - 40, ry + 44); ctx.lineTo(rx - 22, ry + 34); ctx.closePath(); ctx.fill();
  const finColor = v.has('rocket-fin') ? '#1e88e5' : '#e53935';
  ctx.fillStyle = finColor;
  ctx.beginPath(); ctx.moveTo(rx + 22, ry - 10); ctx.lineTo(rx + 22, ry + 30); ctx.lineTo(rx + 40, ry + 44); ctx.lineTo(rx + 22, ry + 34); ctx.closePath(); ctx.fill();
  circle(ctx, rx, ry - 18, 10, '#81d4fa');
  ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(rx, ry - 18, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ff9800';
  ctx.beginPath(); ctx.moveTo(rx - 10, ry + 42); ctx.lineTo(rx, ry + 62); ctx.lineTo(rx + 10, ry + 42); ctx.closePath(); ctx.fill();
  // Lamp
  ctx.fillStyle = '#546e7a';
  ctx.fillRect(556, 250, 8, 110);
  ellipse(ctx, 560, 362, 26, 6, '#546e7a');
  ctx.fillStyle = '#ffb703';
  ctx.beginPath(); ctx.moveTo(536, 250); ctx.lineTo(584, 250); ctx.lineTo(574, 214); ctx.lineTo(546, 214); ctx.closePath(); ctx.fill();
  if (v.has('lamp-shade')) {
    ctx.strokeStyle = '#e65100'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(544, 244); ctx.lineTo(550, 220); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(560, 246); ctx.lineTo(560, 218); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(576, 244); ctx.lineTo(570, 220); ctx.stroke();
  }
  // Teddy bear
  const tx = 190; const ty = 380;
  ctx.fillStyle = '#a1887f';
  circle(ctx, tx - 22, ty - 34, 12, '#a1887f');
  circle(ctx, tx + 22, ty - 34, 12, '#a1887f');
  circle(ctx, tx, ty - 22, 24, '#a1887f');
  ellipse(ctx, tx, ty + 18, 26, 22, '#a1887f');
  ellipse(ctx, tx - 26, ty + 12, 10, 16, '#a1887f');
  ellipse(ctx, tx + 26, ty + 12, 10, 16, '#a1887f');
  circle(ctx, tx - 9, ty - 26, 3, '#222');
  circle(ctx, tx + 9, ty - 26, 3, '#222');
  ellipse(ctx, tx, ty - 16, 8, 6, '#d7ccc8');
  if (v.has('teddy-bow')) {
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(tx, ty - 2); ctx.lineTo(tx - 12, ty - 8); ctx.lineTo(tx - 12, ty + 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx, ty - 2); ctx.lineTo(tx + 12, ty - 8); ctx.lineTo(tx + 12, ty + 4); ctx.closePath(); ctx.fill();
    circle(ctx, tx, ty - 2, 4, '#b71c1c');
  }
  // Rug
  ctx.fillStyle = '#7e57c2';
  rr(ctx, 240, 420, 240, 28, 10); ctx.fill();
  ctx.fillStyle = '#b39ddb';
  ctx.fillRect(270, 420, 24, 28);
  ctx.fillRect(330, 420, 24, 28);
  ctx.fillRect(390, 420, 24, 28);
  if (!v.has('rug-stripe')) ctx.fillRect(450, 420, 24, 28);
  else ctx.fillStyle = '#7e57c2';
  // Ball
  circle(ctx, 560, 430, 18, '#e53935');
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(560, 430, 18, -0.4, 0.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(560, 430, 18, Math.PI - 0.4, Math.PI + 0.9); ctx.stroke();
}

/* ---------------- Scene catalogue ---------------- */
export const SCENES = [
  {
    id: 'garden', name: 'Sunny Garden', intro: 'A bright morning in the garden. Seven little things changed between the two pictures — can you spot them all?',
    timeLimit: 150,
    draw: drawGarden,
    diffs: [
      { id: 'sun-glasses', x: 100, y: 80, r: 30, hint: 'Look at the sun.' },
      { id: 'flower-petal', x: 200, y: 408, r: 26, hint: 'Count the petals on the purple flower.' },
      { id: 'bee-stripes', x: 430, y: 150, r: 28, hint: 'How many stripes does the bee have?' },
      { id: 'butterfly-spot', x: 508, y: 100, r: 24, hint: 'Check the butterfly wings.' },
      { id: 'fence-board', x: 349, y: 337, r: 26, hint: 'One fence board looks different.' },
      { id: 'cloud-extra', x: 470, y: 48, r: 28, hint: 'Count the clouds.' },
      { id: 'mushroom-spots', x: 599, y: 380, r: 28, hint: 'Count the spots on the mushroom.' },
    ],
  },
  {
    id: 'kitchen', name: 'Cozy Kitchen', intro: 'Tea is brewing and the cat is asleep. Seven details changed while you blinked.',
    timeLimit: 150,
    draw: drawKitchen,
    diffs: [
      { id: 'clock-time', x: 520, y: 92, r: 30, hint: 'What time is it on the clock?' },
      { id: 'teapot-steam', x: 302, y: 224, r: 26, hint: 'Is the teapot still steaming?' },
      { id: 'cat-bow', x: 384, y: 392, r: 26, hint: 'Look at the cat closely.' },
      { id: 'fruit-count', x: 182, y: 306, r: 24, hint: 'Check the fruit bowl.' },
      { id: 'window-bird', x: 256, y: 100, r: 26, hint: 'Something outside the window.' },
      { id: 'mug-color', x: 475, y: 308, r: 26, hint: 'What colour is the mug?' },
      { id: 'jar-label', x: 484, y: 167, r: 26, hint: 'Read the labels on the shelf jars.' },
    ],
  },
  {
    id: 'sea', name: 'Deep Sea', intro: 'Down among the corals and the treasure chest, seven things are not the same.',
    timeLimit: 165,
    draw: drawSea,
    diffs: [
      { id: 'fish-extra', x: 180, y: 100, r: 26, hint: 'Count the fish.' },
      { id: 'coral-branch', x: 76, y: 292, r: 26, hint: 'Look at the coral branches.' },
      { id: 'chest-gems', x: 455, y: 348, r: 28, hint: 'How many gems sparkle in the chest?' },
      { id: 'bubbles', x: 222, y: 140, r: 26, hint: 'Follow the bubbles.' },
      { id: 'octopus-arms', x: 530, y: 290, r: 30, hint: 'Count the octopus arms.' },
      { id: 'starfish', x: 150, y: 424, r: 26, hint: 'Something on the sand.' },
      { id: 'seahorse', x: 344, y: 306, r: 26, hint: 'A little seahorse is hiding.' },
    ],
  },
  {
    id: 'camp', name: 'Starry Campsite', intro: 'The fire crackles under the stars. Seven night-time details changed.',
    timeLimit: 165,
    draw: drawCamp,
    diffs: [
      { id: 'moon-crater', x: 540, y: 82, r: 30, hint: 'Look closely at the moon.' },
      { id: 'tent-flag', x: 330, y: 196, r: 26, hint: 'Check the top of the tent.' },
      { id: 'fire-flame', x: 320, y: 376, r: 26, hint: 'How many flames dance in the fire?' },
      { id: 'shooting-star', x: 356, y: 64, r: 28, hint: 'Make a wish — check the sky.' },
      { id: 'pine-ornament', x: 80, y: 296, r: 26, hint: 'The pine tree wears something.' },
      { id: 'lantern-moth', x: 514, y: 346, r: 24, hint: 'Something flutters by the lantern.' },
      { id: 'boots', x: 440, y: 404, r: 28, hint: 'Check the ground by the tent.' },
    ],
  },
  {
    id: 'workshop', name: 'Toy Workshop', intro: 'The toymaker stepped out. Seven tiny things in the workshop are different.',
    timeLimit: 180,
    draw: drawWorkshop,
    diffs: [
      { id: 'globe-tilt', x: 122, y: 268, r: 30, hint: 'The globe looks different.' },
      { id: 'rocket-fin', x: 508, y: 204, r: 26, hint: 'Check the rocket fins.' },
      { id: 'book-color', x: 152, y: 160, r: 24, hint: 'One book spine changed colour.' },
      { id: 'lamp-shade', x: 560, y: 232, r: 26, hint: 'Look at the lampshade.' },
      { id: 'rug-stripe', x: 462, y: 434, r: 26, hint: 'Count the stripes on the rug.' },
      { id: 'teddy-bow', x: 190, y: 378, r: 26, hint: 'The teddy bear is dressed differently.' },
      { id: 'gear-teeth', x: 520, y: 300, r: 30, hint: 'Count the teeth on the wall gear.' },
    ],
  },
];
