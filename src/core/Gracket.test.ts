import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Gracket } from './Gracket';
import type { TournamentData } from '../types';

describe('Gracket', () => {
  let container: HTMLElement;
  const testData: TournamentData = [
    [
      [
        { name: 'Team A', id: 'team-a', seed: 1, score: 100 },
        { name: 'Team B', id: 'team-b', seed: 8, score: 85 },
      ],
      [
        { name: 'Team C', id: 'team-c', seed: 4, score: 90 },
        { name: 'Team D', id: 'team-d', seed: 5, score: 88 },
      ],
    ],
    [
      [
        { name: 'Team A', id: 'team-a', seed: 1, score: 95 },
        { name: 'Team C', id: 'team-c', seed: 4, score: 92 },
      ],
    ],
    [[{ name: 'Team A', id: 'team-a', seed: 1 }]],
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('constructor', () => {
    it('should create instance with element', () => {
      const gracket = new Gracket(container, { src: testData });
      expect(gracket).toBeInstanceOf(Gracket);
    });

    it('should create instance with selector string', () => {
      container.id = 'test-bracket';
      const gracket = new Gracket('#test-bracket', { src: testData });
      expect(gracket).toBeInstanceOf(Gracket);
    });

    it('should throw error if container not found', () => {
      expect(() => {
        new Gracket('#non-existent', { src: testData });
      }).toThrow('Container element not found');
    });

    it('should throw error if no data provided', () => {
      expect(() => {
        new Gracket(container);
      }).toThrow('No tournament data provided');
    });

    it('should parse data from data-gracket attribute', () => {
      container.setAttribute('data-gracket', JSON.stringify(testData));
      const gracket = new Gracket(container);
      expect(gracket.getData()).toEqual(testData);
    });
  });

  describe('initialization', () => {
    it('should add gracket class to container', () => {
      new Gracket(container, { src: testData });
      expect(container.classList.contains('g_gracket')).toBe(true);
    });

    it('should create canvas element', () => {
      new Gracket(container, { src: testData });
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas?.className).toBe('g_canvas');
    });

    it('should create rounds', () => {
      new Gracket(container, { src: testData });
      const rounds = container.querySelectorAll('.g_round');
      expect(rounds.length).toBe(testData.length);
    });

    it('should create games', () => {
      new Gracket(container, { src: testData });
      const games = container.querySelectorAll('.g_game');
      const expectedGames = testData.reduce((sum, round) => sum + round.length, 0);
      expect(games.length).toBe(expectedGames);
    });

    it('should create teams', () => {
      new Gracket(container, { src: testData });
      const teams = container.querySelectorAll('.g_team');
      const expectedTeams = testData.reduce(
        (sum, round) => sum + round.reduce((s, game) => s + game.length, 0),
        0
      );
      expect(teams.length).toBe(expectedTeams);
    });
  });

  describe('custom options', () => {
    it('should use custom class names', () => {
      new Gracket(container, {
        src: testData,
        gracketClass: 'custom-bracket',
        gameClass: 'custom-game',
        roundClass: 'custom-round',
      });

      expect(container.classList.contains('custom-bracket')).toBe(true);
      expect(container.querySelector('.custom-round')).toBeTruthy();
      expect(container.querySelector('.custom-game')).toBeTruthy();
    });

    it('should apply custom canvas settings', () => {
      new Gracket(container, {
        src: testData,
        canvasLineColor: '#ff0000',
        canvasLineWidth: 5,
      });

      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas).toBeTruthy();
    });

    it('should display custom round labels', () => {
      const labels = ['Quarter Finals', 'Semi Finals', 'Finals'];
      new Gracket(container, {
        src: testData,
        roundLabels: labels,
      });

      const labelElements = container.querySelectorAll('.g_round_label');
      expect(labelElements.length).toBe(testData.length);
      expect(labelElements[0].textContent).toBe(labels[0]);
    });
  });

  describe('team rendering', () => {
    it('should display team names', () => {
      new Gracket(container, { src: testData });
      const firstTeam = container.querySelector('.g_team h3');
      expect(firstTeam?.textContent).toContain('Team A');
    });

    it('should display seeds', () => {
      new Gracket(container, { src: testData });
      const seed = container.querySelector('.g_seed');
      expect(seed?.textContent).toBe('1');
    });

    it('should display scores', () => {
      new Gracket(container, { src: testData });
      const score = container.querySelector('.g_team h3 small');
      expect(score?.textContent).toBe('100');
    });

    it('should use displaySeed if provided', () => {
      const dataWithDisplaySeed: TournamentData = [
        [[{ name: 'Team A', seed: 1, displaySeed: 'A1' }]],
      ];
      new Gracket(container, { src: dataWithDisplaySeed });
      const seed = container.querySelector('.g_seed');
      expect(seed?.textContent).toBe('A1');
    });

    it('should add team id as class', () => {
      new Gracket(container, { src: testData });
      const team = container.querySelector('.team-a');
      expect(team).toBeTruthy();
    });
  });

  describe('winner handling', () => {
    it('should add winner class to final team', () => {
      new Gracket(container, { src: testData });
      const winner = container.querySelector('.g_winner');
      expect(winner).toBeTruthy();
    });

    it('should position winner correctly', () => {
      new Gracket(container, { src: testData });
      const winner = container.querySelector('.g_winner') as HTMLElement;
      expect(winner.style.marginTop).toBeTruthy();
    });
  });

  describe('public methods', () => {
    it('should update with new data', () => {
      const gracket = new Gracket(container, { src: testData });
      const newData: TournamentData = [
        [[{ name: 'New Team', seed: 1 }]],
      ];

      gracket.update(newData);

      expect(gracket.getData()).toEqual(newData);
      const teamName = container.querySelector('.g_team h3');
      expect(teamName?.textContent).toContain('New Team');
    });

    it('should return current settings', () => {
      const options = { canvasLineColor: '#ff0000', cornerRadius: 20 };
      const gracket = new Gracket(container, { src: testData, ...options });
      const settings = gracket.getSettings();

      expect(settings.canvasLineColor).toBe(options.canvasLineColor);
      expect(settings.cornerRadius).toBe(options.cornerRadius);
    });

    it('should return current data', () => {
      const gracket = new Gracket(container, { src: testData });
      expect(gracket.getData()).toEqual(testData);
    });

    it('should destroy bracket and clean up', () => {
      const gracket = new Gracket(container, { src: testData });
      gracket.destroy();

      expect(container.innerHTML).toBe('');
      expect(container.classList.contains('g_gracket')).toBe(false);
    });
  });

  describe('canvas drawing', () => {
    it('should create canvas with correct dimensions', () => {
      new Gracket(container, { src: testData });
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should have correct canvas styles', () => {
      new Gracket(container, { src: testData });
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;

      expect(canvas.style.position).toBe('absolute');
      expect(canvas.style.pointerEvents).toBe('none');
      expect(canvas.style.zIndex).toBe('1');
    });
  });

  describe('hover interaction', () => {
    it('should add current class on hover', () => {
      new Gracket(container, { src: testData });
      const team = container.querySelector('.team-a') as HTMLElement;

      team.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      const highlightedTeams = container.querySelectorAll('.team-a.g_current');
      expect(highlightedTeams.length).toBeGreaterThan(0);
    });

    it('should remove current class on mouse leave', () => {
      new Gracket(container, { src: testData });
      const team = container.querySelector('.team-a') as HTMLElement;

      team.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      team.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      const highlightedTeams = container.querySelectorAll('.team-a.g_current');
      expect(highlightedTeams.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle single round tournament', () => {
      const singleRound: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1 },
            { name: 'Team B', seed: 2 },
          ],
        ],
        [[{ name: 'Team A', seed: 1 }]],
      ];

      new Gracket(container, { src: singleRound });
      expect(container.querySelector('.g_gracket')).toBeTruthy();
    });

    it('should handle teams without scores', () => {
      const noScores: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1 },
            { name: 'Team B', seed: 2 },
          ],
        ],
      ];

      new Gracket(container, { src: noScores });
      const scores = container.querySelectorAll('.g_team h3 small');
      scores.forEach((score) => expect(score.textContent).toBe(''));
    });

    it('should handle teams without ids', () => {
      const noIds: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1 },
            { name: 'Team B', seed: 2 },
          ],
        ],
      ];

      new Gracket(container, { src: noIds });
      expect(container.querySelector('.g_gracket')).toBeTruthy();
    });
  });
});
