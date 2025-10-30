import { Gracket } from './index';
import { sampleTournamentData, generateTournamentData } from './test-utils';
import type { TournamentData } from './types';
import './style.css';

let gracket: Gracket | null = null;
let styleToggle = false;
let currentData: TournamentData = sampleTournamentData;

// 4-team tournament data
const smallTournamentData: TournamentData = [
  [
    [
      { name: 'Warriors', id: 'warriors', seed: 1, score: 105 },
      { name: 'Lakers', id: 'lakers', seed: 4, score: 98 },
    ],
    [
      { name: 'Celtics', id: 'celtics', seed: 2, score: 110 },
      { name: 'Heat', id: 'heat', seed: 3, score: 102 },
    ],
  ],
  [
    [
      { name: 'Warriors', id: 'warriors', seed: 1, score: 112 },
      { name: 'Celtics', id: 'celtics', seed: 2, score: 108 },
    ],
  ],
  [[{ name: 'Warriors', id: 'warriors', seed: 1 }]],
];

// Initialize main bracket
function initBracket(data: TournamentData = sampleTournamentData) {
  const container = document.getElementById('main-bracket');
  if (!container) return;

  currentData = data;
  
  gracket = new Gracket(container, {
    src: data,
    cornerRadius: 15,
    canvasLineColor: '#667eea',
    canvasLineWidth: 2,
    roundLabels: data === sampleTournamentData 
      ? ['Round 1', 'Round 2', 'Semi Finals', 'Finals', 'Winner']
      : data.length === 3
      ? ['Semi Finals', 'Finals', 'Champion']
      : ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Winner'],
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
  gracket.update(currentData);
}

// Show small bracket
function showSmallBracket() {
  if (!gracket) return;
  gracket.destroy();
  initBracket(smallTournamentData);
}

// Show large bracket
function showLargeBracket() {
  if (!gracket) return;
  gracket.destroy();
  initBracket(sampleTournamentData);
}

// Change bracket style
function changeStyle() {
  if (!gracket) return;

  styleToggle = !styleToggle;

  gracket.destroy();
  gracket = new Gracket('#main-bracket', {
    src: currentData,
    cornerRadius: styleToggle ? 5 : 20,
    canvasLineColor: styleToggle ? '#764ba2' : '#667eea',
    canvasLineWidth: styleToggle ? 3 : 2,
    canvasLineCap: styleToggle ? 'square' : 'round',
    roundLabels: currentData === sampleTournamentData 
      ? ['Round 1', 'Round 2', 'Semi Finals', 'Finals', 'Winner']
      : currentData.length === 3
      ? ['Semi Finals', 'Finals', 'Champion']
      : ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Winner'],
  });
}

// Setup event listeners
function setupControls() {
  document.getElementById('update-scores')?.addEventListener('click', updateScores);
  document.getElementById('reset-bracket')?.addEventListener('click', resetBracket);
  document.getElementById('change-style')?.addEventListener('click', changeStyle);
  document.getElementById('show-small')?.addEventListener('click', showSmallBracket);
  document.getElementById('show-large')?.addEventListener('click', showLargeBracket);
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
