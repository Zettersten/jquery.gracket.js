import { Gracket } from './index';
import { sampleTournamentData } from './test-utils';
import './style.css';

let gracket: Gracket | null = null;
let styleToggle = false;

// Initialize main bracket
function initBracket() {
  const container = document.getElementById('main-bracket');
  if (!container) return;

  gracket = new Gracket(container, {
    src: sampleTournamentData,
    cornerRadius: 15,
    canvasLineColor: '#667eea',
    canvasLineWidth: 2,
    roundLabels: ['Round 1', 'Round 2', 'Semi Finals', 'Finals', 'Winner'],
  });
}

// Update scores randomly
function updateScores() {
  if (!gracket) return;

  const data = gracket.getData().map((round) =>
    round.map((game) =>
      game.map((team) => ({
        ...team,
        score: Math.floor(Math.random() * 100) + 50,
      }))
    )
  );

  gracket.update(data);
}

// Reset bracket
function resetBracket() {
  if (!gracket) return;
  gracket.update(sampleTournamentData);
}

// Change bracket style
function changeStyle() {
  if (!gracket) return;

  styleToggle = !styleToggle;

  gracket.destroy();
  gracket = new Gracket('#main-bracket', {
    src: sampleTournamentData,
    cornerRadius: styleToggle ? 5 : 20,
    canvasLineColor: styleToggle ? '#764ba2' : '#667eea',
    canvasLineWidth: styleToggle ? 3 : 2,
    canvasLineCap: styleToggle ? 'square' : 'round',
    roundLabels: ['Round 1', 'Round 2', 'Semi Finals', 'Finals', 'Winner'],
  });
}

// Setup event listeners
function setupControls() {
  document.getElementById('update-scores')?.addEventListener('click', updateScores);
  document.getElementById('reset-bracket')?.addEventListener('click', resetBracket);
  document.getElementById('change-style')?.addEventListener('click', changeStyle);
}

// Setup tab switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');

      tabs.forEach((t) => t.classList.remove('active'));
      contents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      document.querySelector(`[data-content="${tabName}"]`)?.classList.add('active');
    });
  });
}

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
  initBracket();
  setupControls();
  setupTabs();
});
