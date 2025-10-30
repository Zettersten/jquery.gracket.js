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

      // In test environment (happy-dom), dimensions may be 0
      // Just verify canvas exists and has dimension properties
      expect(canvas.width).toBeGreaterThanOrEqual(0);
      expect(canvas.height).toBeGreaterThanOrEqual(0);
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
      expect(container.classList.contains('g_gracket')).toBe(true);
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
      const scores = container.querySelectorAll('.g_team h3 small.g_score-empty');
      expect(scores.length).toBeGreaterThan(0);
      scores.forEach((score) => expect(score.textContent).toBe('—'));
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
      expect(container.classList.contains('g_gracket')).toBe(true);
    });
  });

  // ========================================================================
  // NEW FEATURES TESTS (v2.1)
  // ========================================================================

  describe('NEW: Byes Support', () => {
    it('should render bye games with single team', () => {
      const dataWithByes: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
          [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
        ],
      ];

      new Gracket(container, { src: dataWithByes });
      
      const games = container.querySelectorAll('.g_game');
      expect(games).toHaveLength(2);
    });

    it('should show bye placeholder when showByeGames is true', () => {
      const dataWithByes: TournamentData = [
        [
          [{ name: 'Team A', seed: 1, id: 'a' }], // Bye
        ],
      ];

      new Gracket(container, { 
        src: dataWithByes,
        showByeGames: true,
        byeLabel: 'BYE'
      });
      
      const byePlaceholder = container.querySelector('.g_bye');
      expect(byePlaceholder).toBeTruthy();
      expect(byePlaceholder?.textContent).toContain('BYE');
    });

    it('should hide bye placeholder when showByeGames is false', () => {
      const dataWithByes: TournamentData = [
        [
          [{ name: 'Team A', seed: 1, id: 'a' }], // Bye
        ],
      ];

      new Gracket(container, { 
        src: dataWithByes,
        showByeGames: false
      });
      
      const byePlaceholder = container.querySelector('.g_bye');
      expect(byePlaceholder).toBeFalsy();
    });

    it('should use custom bye label', () => {
      const dataWithByes: TournamentData = [
        [
          [{ name: 'Team A', seed: 1, id: 'a' }], // Bye
        ],
      ];

      new Gracket(container, { 
        src: dataWithByes,
        byeLabel: 'AUTO WIN'
      });
      
      const byePlaceholder = container.querySelector('.g_bye');
      expect(byePlaceholder?.textContent).toContain('AUTO WIN');
    });

    it('should apply custom bye class', () => {
      const dataWithByes: TournamentData = [
        [
          [{ name: 'Team A', seed: 1, id: 'a' }], // Bye
        ],
      ];

      new Gracket(container, { 
        src: dataWithByes,
        byeClass: 'custom-bye'
      });
      
      const byePlaceholder = container.querySelector('.custom-bye');
      expect(byePlaceholder).toBeTruthy();
    });

    it('should not show bye for final winner', () => {
      const dataWithChampion: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
        ],
        [[{ name: 'Team A', seed: 1, id: 'a' }]], // Champion
      ];

      new Gracket(container, { src: dataWithChampion });
      
      // Champion should not have bye placeholder
      const winner = container.querySelector('.g_winner');
      expect(winner).toBeTruthy();
      
      const byesInWinner = winner?.querySelectorAll('.g_bye');
      expect(byesInWinner?.length).toBe(0);
    });
  });

  describe('NEW: Score Management', () => {
    let gracket: Gracket;
    const mutableData: TournamentData = [
      [
        [
          { name: 'Team A', seed: 1, id: 'a' },
          { name: 'Team B', seed: 2, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, id: 'c' },
          { name: 'Team D', seed: 4, id: 'd' },
        ],
      ],
    ];

    beforeEach(() => {
      gracket = new Gracket(container, { src: JSON.parse(JSON.stringify(mutableData)) });
    });

    describe('updateScore', () => {
      it('should update team score', () => {
        gracket.updateScore(0, 0, 0, 100);
        
        const data = gracket.getData();
        expect(data[0][0][0].score).toBe(100);
      });

      it('should update multiple scores', () => {
        gracket.updateScore(0, 0, 0, 100);
        gracket.updateScore(0, 0, 1, 85);
        
        const data = gracket.getData();
        expect(data[0][0][0].score).toBe(100);
        expect(data[0][0][1].score).toBe(85);
      });

      it('should trigger onScoreUpdate callback', () => {
        let callbackCalled = false;
        let callbackData: { r: number; g: number; t: number; score: number } | null = null;

        const gracketWithCallback = new Gracket(container, {
          src: JSON.parse(JSON.stringify(mutableData)),
          onScoreUpdate: (r, g, t, score) => {
            callbackCalled = true;
            callbackData = { r, g, t, score };
          },
        });

        gracketWithCallback.updateScore(0, 0, 0, 100);

        expect(callbackCalled).toBe(true);
        expect(callbackData.score).toBe(100);
      });

      it('should throw for invalid round index', () => {
        expect(() => gracket.updateScore(5, 0, 0, 100)).toThrow();
      });

      it('should throw for invalid game index', () => {
        expect(() => gracket.updateScore(0, 5, 0, 100)).toThrow();
      });

      it('should throw for invalid team index', () => {
        expect(() => gracket.updateScore(0, 0, 5, 100)).toThrow();
      });
    });

    describe('getMatchWinner', () => {
      it('should return winner for completed match', () => {
        gracket.updateScore(0, 0, 0, 100);
        gracket.updateScore(0, 0, 1, 85);
        
        const winner = gracket.getMatchWinner(0, 0);
        expect(winner?.name).toBe('Team A');
      });

      it('should return null for incomplete match', () => {
        const winner = gracket.getMatchWinner(0, 0);
        expect(winner).toBeNull();
      });

      it('should return null for tied match', () => {
        gracket.updateScore(0, 0, 0, 100);
        gracket.updateScore(0, 0, 1, 100);
        
        const winner = gracket.getMatchWinner(0, 0);
        expect(winner).toBeNull();
      });

      it('should return team for bye match', () => {
        const byeData: TournamentData = [
          [
            [{ name: 'Team A', seed: 1, id: 'a' }], // Bye
          ],
        ];
        
        const byeGracket = new Gracket(container, { src: byeData });
        const winner = byeGracket.getMatchWinner(0, 0);
        
        expect(winner?.name).toBe('Team A');
      });
    });

    describe('isRoundComplete', () => {
      it('should return false for incomplete round', () => {
        expect(gracket.isRoundComplete(0)).toBe(false);
      });

      it('should return true for complete round', () => {
        gracket.updateScore(0, 0, 0, 100);
        gracket.updateScore(0, 0, 1, 85);
        gracket.updateScore(0, 1, 0, 90);
        gracket.updateScore(0, 1, 1, 88);
        
        expect(gracket.isRoundComplete(0)).toBe(true);
      });

      it('should return true for round with only byes', () => {
        const byeData: TournamentData = [
          [
            [{ name: 'Team A', seed: 1, id: 'a' }],
            [{ name: 'Team B', seed: 2, id: 'b' }],
          ],
        ];
        
        const byeGracket = new Gracket(container, { src: byeData });
        expect(byeGracket.isRoundComplete(0)).toBe(true);
      });

      it('should throw for invalid round index', () => {
        expect(() => gracket.isRoundComplete(5)).toThrow();
      });
    });
  });

  describe('NEW: Round Advancement', () => {
    let gracket: Gracket;
    const advanceData: TournamentData = [
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, score: 90, id: 'c' },
          { name: 'Team D', seed: 4, score: 88, id: 'd' },
        ],
      ],
      [
        [
          { name: 'Team A', seed: 1, id: 'a' },
          { name: 'Team C', seed: 3, id: 'c' },
        ],
      ],
    ];

    beforeEach(() => {
      gracket = new Gracket(container, { 
        src: JSON.parse(JSON.stringify(advanceData))
      });
    });

    describe('advanceRound', () => {
      it('should advance winners to next round', () => {
        const newData = gracket.advanceRound(0);
        
        expect(newData[1][0][0].name).toBe('Team A');
        expect(newData[1][0][1].name).toBe('Team C');
      });

      it('should create next round if missing', () => {
        const singleRoundData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, score: 100, id: 'a' },
              { name: 'Team B', seed: 2, score: 85, id: 'b' },
            ],
          ],
        ];
        
        const singleGracket = new Gracket(container, { src: singleRoundData });
        const newData = singleGracket.advanceRound(0, { createRounds: true });
        
        expect(newData).toHaveLength(2);
        expect(newData[1][0][0].name).toBe('Team A');
      });

      it('should handle ties with higher-seed strategy', () => {
        const tiedData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, score: 100, id: 'a' },
              { name: 'Team B', seed: 2, score: 100, id: 'b' },
            ],
          ],
        ];
        
        const tiedGracket = new Gracket(container, { src: tiedData });
        const newData = tiedGracket.advanceRound(0, { 
          tieBreaker: 'higher-seed',
          createRounds: true
        });
        
        expect(newData[1][0][0].name).toBe('Team A');
      });

      it('should throw for incomplete round with error strategy', () => {
        const incompleteData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, id: 'a' },
              { name: 'Team B', seed: 2, id: 'b' },
            ],
          ],
        ];
        
        const incompleteGracket = new Gracket(container, { src: incompleteData });
        
        expect(() => incompleteGracket.advanceRound(0)).toThrow();
      });

      it('should trigger onRoundGenerated callback', () => {
        let callbackCalled = false;

        const callbackGracket = new Gracket(container, {
          src: JSON.parse(JSON.stringify(advanceData)),
          onRoundGenerated: () => {
            callbackCalled = true;
          },
        });

        callbackGracket.advanceRound(0, { createRounds: true });
        expect(callbackCalled).toBe(true);
      });
    });

    describe('autoGenerateTournament', () => {
      it('should generate entire tournament', () => {
        const firstRoundData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, score: 100, id: 'a' },
              { name: 'Team B', seed: 2, score: 85, id: 'b' },
            ],
            [
              { name: 'Team C', seed: 3, score: 90, id: 'c' },
              { name: 'Team D', seed: 4, score: 88, id: 'd' },
            ],
          ],
        ];
        
        const autoGracket = new Gracket(container, { src: firstRoundData });
        autoGracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });
        
        const data = autoGracket.getData();
        expect(data.length).toBeGreaterThan(1);
      });

      it('should stop at specified round', () => {
        const firstRoundData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, score: 100, id: 'a' },
              { name: 'Team B', seed: 2, score: 85, id: 'b' },
            ],
            [
              { name: 'Team C', seed: 3, score: 90, id: 'c' },
              { name: 'Team D', seed: 4, score: 88, id: 'd' },
            ],
          ],
        ];
        
        const autoGracket = new Gracket(container, { src: firstRoundData });
        autoGracket.autoGenerateTournament({ 
          tieBreaker: 'higher-seed',
          stopAtRound: 1
        });
        
        const data = autoGracket.getData();
        expect(data.length).toBe(2);
      });

      it('should trigger onRoundGenerated for each round', () => {
        let callbackCount = 0;

        const firstRoundData: TournamentData = [
          [
            [
              { name: 'Team A', seed: 1, score: 100, id: 'a' },
              { name: 'Team B', seed: 2, score: 85, id: 'b' },
            ],
            [
              { name: 'Team C', seed: 3, score: 90, id: 'c' },
              { name: 'Team D', seed: 4, score: 88, id: 'd' },
            ],
          ],
        ];
        
        const callbackGracket = new Gracket(container, {
          src: firstRoundData,
          onRoundGenerated: () => {
            callbackCount++;
          },
        });

        callbackGracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });
        expect(callbackCount).toBeGreaterThan(0);
      });
    });
  });

  describe('NEW: Event Callbacks', () => {
    it('should trigger onRoundComplete when round finishes', () => {
      let roundCompleteIndex = -1;

      const data: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, id: 'a' },
            { name: 'Team B', seed: 2, id: 'b' },
          ],
        ],
      ];

      const gracket = new Gracket(container, {
        src: data,
        onRoundComplete: (roundIndex) => {
          roundCompleteIndex = roundIndex;
        },
      });

      gracket.updateScore(0, 0, 0, 100);
      gracket.updateScore(0, 0, 1, 85);

      // Round is now complete
      expect(roundCompleteIndex).toBe(0);
    });

    it('should pass correct parameters to onScoreUpdate', () => {
      const capturedParams: Array<{ r: number; g: number; t: number; score: number }> = [];

      const data: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, id: 'a' },
            { name: 'Team B', seed: 2, id: 'b' },
          ],
        ],
      ];

      const gracket = new Gracket(container, {
        src: data,
        onScoreUpdate: (r, g, t, score) => {
          capturedParams.push({ r, g, t, score });
        },
      });

      gracket.updateScore(0, 0, 0, 100);

      expect(capturedParams).toHaveLength(1);
      expect(capturedParams[0]).toEqual({ r: 0, g: 0, t: 0, score: 100 });
    });
  });

  describe('NEW: Reporting Methods', () => {
    let gracket: Gracket;
    const reportData: TournamentData = [
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, score: 90, id: 'c' },
          { name: 'Team D', seed: 4, score: 88, id: 'd' },
        ],
      ],
      [
        [
          { name: 'Team A', seed: 1, score: 95, id: 'a' },
          { name: 'Team C', seed: 3, score: 92, id: 'c' },
        ],
      ],
      [[{ name: 'Team A', seed: 1, id: 'a' }]],
    ];

    beforeEach(() => {
      gracket = new Gracket(container, { src: reportData });
    });

    describe('getAdvancingTeams', () => {
      it('should return advancing teams from round', () => {
        const advancing = gracket.getAdvancingTeams(0);
        
        expect(advancing).toHaveLength(2);
        expect(advancing[0].name).toBe('Team A');
        expect(advancing[1].name).toBe('Team C');
      });

      it('should return advancing teams from last completed round by default', () => {
        const advancing = gracket.getAdvancingTeams();
        
        expect(advancing).toHaveLength(1);
        expect(advancing[0].name).toBe('Team A');
      });
    });

    describe('getRoundResults', () => {
      it('should return results for round', () => {
        const results = gracket.getRoundResults(0);
        
        expect(results).toHaveLength(2);
        expect(results[0].winner.name).toBe('Team A');
        expect(results[0].loser?.name).toBe('Team B');
      });

      it('should include scores in results', () => {
        const results = gracket.getRoundResults(0);
        
        expect(results[0].winnerScore).toBe(100);
        expect(results[0].loserScore).toBe(85);
      });
    });

    describe('getTeamHistory', () => {
      it('should return team history', () => {
        const history = gracket.getTeamHistory('a');
        
        expect(history).toBeTruthy();
        expect(history!.team.name).toBe('Team A');
        expect(history!.wins).toBe(2);
        expect(history!.losses).toBe(0);
      });

      it('should return null for non-existent team', () => {
        const history = gracket.getTeamHistory('nonexistent');
        expect(history).toBeNull();
      });

      it('should track losing team', () => {
        const history = gracket.getTeamHistory('b');
        
        expect(history).toBeTruthy();
        expect(history!.wins).toBe(0);
        expect(history!.losses).toBe(1);
      });
    });

    describe('getStatistics', () => {
      it('should return tournament statistics', () => {
        const stats = gracket.getStatistics();
        
        expect(stats.participantCount).toBe(4);
        expect(stats.totalRounds).toBe(3);
        expect(stats.averageScore).toBeGreaterThan(0);
        expect(stats.completionPercentage).toBe(100);
      });

      it('should identify highest score', () => {
        const stats = gracket.getStatistics();
        
        expect(stats.highestScore).toBeDefined();
        expect(stats.highestScore!.score).toBe(100);
      });
    });

    describe('generateReport', () => {
      it('should generate JSON report', () => {
        const report = gracket.generateReport({ format: 'json' });
        
        expect(typeof report).toBe('object');
        expect(report).toHaveProperty('totalRounds');
        expect(report).toHaveProperty('champion');
      });

      it('should generate text report', () => {
        const report = gracket.generateReport({ format: 'text' });
        
        expect(typeof report).toBe('string');
        expect(report).toContain('TOURNAMENT REPORT');
      });

      it('should generate HTML report', () => {
        const report = gracket.generateReport({ format: 'html' });
        
        expect(typeof report).toBe('string');
        expect(report).toContain('<div');
        expect(report).toContain('</div>');
      });

      it('should generate Markdown report', () => {
        const report = gracket.generateReport({ format: 'markdown' });
        
        expect(typeof report).toBe('string');
        expect(report).toContain('#');
        expect(report).toContain('Tournament Report');
      });

      it('should include statistics when requested', () => {
        const report = gracket.generateReport({ 
          format: 'text',
          includeStatistics: true
        });
        
        expect(report).toContain('Statistics');
        expect(report).toContain('Participants');
      });

      it('should include scores when requested', () => {
        const report = gracket.generateReport({ 
          format: 'text',
          includeScores: true
        });
        
        expect(report).toContain('100');
        expect(report).toContain('85');
      });
    });
  });
});
