// Spot the Difference — The Curio Garden. Entry point: boot the game and
// pick the opening screen (title, or a deterministic ?shot= scene used for
// the entry screenshots: start, play, end).
import { Game } from './game.js';

window.addEventListener('error', (event) => {
  document.title = `GAME-ERROR: ${event.message}`;
});

const game = new Game();
game.applyShot();
