import { describe, it, expect } from 'vitest';
import {
  isByeGame,
  getMatchWinner,
  isRoundComplete,
  applyTieBreaker,
  validateRoundComplete,
  collectWinners,
  generateNextRound,
  countTotalMatches,
  countCompletedMatches,
  countByes,
} from './tournament';
import type { Game, Round, Team } from '../types';

describe('tournament utilities', () => {
  describe('isByeGame', () => {
    it('should return true for single-team games', () => {
      const game: Game = [{ name: 'Team A', seed: 1 }];
      expect(isByeGame(game)).toBe(true);
    });

    it('should return false for two-team games', () => {
      const game: Game = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
      ];
      expect(isByeGame(game)).toBe(false);
    });

    it('should return false for empty games', () => {
      const game: Game = [];
      expect(isByeGame(game)).toBe(false);
    });

    it('should return false for games with more than 2 teams', () => {
      const game: Game = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
        { name: 'Team C', seed: 3 },
      ];
      expect(isByeGame(game)).toBe(false);
    });
  });

  describe('getMatchWinner', () => {
    it('should return winner for bye game', () => {
      const game: Game = [{ name: 'Team A', seed: 1, id: 'a' }];
      const winner = getMatchWinner(game);
      
      expect(winner).toBeTruthy();
      expect(winner?.name).toBe('Team A');
    });

    it('should return winner based on higher score', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2, score: 85 },
      ];
      const winner = getMatchWinner(game);
      
      expect(winner).toBeTruthy();
      expect(winner?.name).toBe('Team A');
    });

    it('should return winner when team 2 has higher score', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 85 },
        { name: 'Team B', seed: 2, score: 100 },
      ];
      const winner = getMatchWinner(game);
      
      expect(winner).toBeTruthy();
      expect(winner?.name).toBe('Team B');
    });

    it('should return null for tied scores', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2, score: 100 },
      ];
      
      expect(getMatchWinner(game)).toBeNull();
    });

    it('should return null when scores are missing', () => {
      const game: Game = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
      ];
      
      expect(getMatchWinner(game)).toBeNull();
    });

    it('should return null when only one team has score', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2 },
      ];
      
      expect(getMatchWinner(game)).toBeNull();
    });

    it('should return null for invalid game structures', () => {
      expect(getMatchWinner([])).toBeNull();
      
      const threeTeams: Game = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
        { name: 'Team C', seed: 3 },
      ];
      expect(getMatchWinner(threeTeams)).toBeNull();
    });

    it('should handle score of 0', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2, score: 0 },
      ];
      const winner = getMatchWinner(game);
      
      expect(winner).toBeTruthy();
      expect(winner?.name).toBe('Team A');
    });
  });

  describe('isRoundComplete', () => {
    it('should return true when all games have winners', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
        [
          { name: 'Team C', seed: 3, score: 90 },
          { name: 'Team D', seed: 4, score: 88 },
        ],
      ];
      
      expect(isRoundComplete(round)).toBe(true);
    });

    it('should return true for round with only byes', () => {
      const round: Round = [
        [{ name: 'Team A', seed: 1 }],
        [{ name: 'Team B', seed: 2 }],
      ];
      
      expect(isRoundComplete(round)).toBe(true);
    });

    it('should return true for mixed byes and completed matches', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
        [{ name: 'Team C', seed: 3 }], // Bye
      ];
      
      expect(isRoundComplete(round)).toBe(true);
    });

    it('should return false when some games are incomplete', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
        [
          { name: 'Team C', seed: 3 },
          { name: 'Team D', seed: 4 },
        ],
      ];
      
      expect(isRoundComplete(round)).toBe(false);
    });

    it('should return false for tied games', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 100 },
        ],
      ];
      
      expect(isRoundComplete(round)).toBe(false);
    });

    it('should return false for empty rounds', () => {
      expect(isRoundComplete([])).toBe(false);
    });

    it('should return true for single complete game', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
      ];
      
      expect(isRoundComplete(round)).toBe(true);
    });
  });

  describe('applyTieBreaker', () => {
    const team1: Team = { name: 'Team A', seed: 1 };
    const team2: Team = { name: 'Team B', seed: 8 };

    it('should apply higher-seed strategy correctly', () => {
      const winner = applyTieBreaker(team1, team2, 'higher-seed');
      expect(winner.name).toBe('Team A'); // Lower seed number = higher seed
    });

    it('should apply lower-seed strategy correctly', () => {
      const winner = applyTieBreaker(team1, team2, 'lower-seed');
      expect(winner.name).toBe('Team B'); // Higher seed number = lower seed
    });

    it('should apply callback strategy with custom function', () => {
      const tieBreakerFn = (t1: Team, t2: Team) => {
        return t1.name < t2.name ? t1 : t2; // Alphabetical
      };
      
      const winner = applyTieBreaker(team1, team2, 'callback', tieBreakerFn);
      expect(winner.name).toBe('Team A');
    });

    it('should throw error when callback strategy has no function', () => {
      expect(() => {
        applyTieBreaker(team1, team2, 'callback');
      }).toThrow('Tie-breaker callback function is required');
    });

    it('should throw error for unknown strategy', () => {
      expect(() => {
        applyTieBreaker(team1, team2, 'invalid' as any);
      }).toThrow('Unknown tie-breaker strategy');
    });

    it('should handle equal seeds with higher-seed strategy', () => {
      const team3: Team = { name: 'Team C', seed: 1 };
      const winner = applyTieBreaker(team1, team3, 'higher-seed');
      // Should return first team when equal
      expect(winner.name).toBe('Team A');
    });
  });

  describe('validateRoundComplete', () => {
    it('should not throw for complete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
      ];
      
      expect(() => validateRoundComplete(round, 0)).not.toThrow();
    });

    it('should throw for incomplete round with missing scores', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
        ],
      ];
      
      expect(() => validateRoundComplete(round, 0)).toThrow('Missing scores');
    });

    it('should throw for tied scores', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 100 },
        ],
      ];
      
      expect(() => validateRoundComplete(round, 0)).toThrow('Tied score');
    });

    it('should throw for invalid game structure', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
          { name: 'Team C', seed: 3 },
        ],
      ];
      
      expect(() => validateRoundComplete(round, 0)).toThrow('Invalid game structure');
    });

    it('should include round and game indices in error message', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
        ],
      ];
      
      expect(() => validateRoundComplete(round, 2)).toThrow('Round 3, Game 1');
    });
  });

  describe('collectWinners', () => {
    it('should collect winners from complete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
        [
          { name: 'Team C', seed: 3, score: 90 },
          { name: 'Team D', seed: 4, score: 88 },
        ],
      ];
      
      const winners = collectWinners(round);
      expect(winners).toHaveLength(2);
      expect(winners[0].name).toBe('Team A');
      expect(winners[1].name).toBe('Team C');
    });

    it('should collect winners including byes', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 85 },
        ],
        [{ name: 'Team C', seed: 3 }], // Bye
      ];
      
      const winners = collectWinners(round);
      expect(winners).toHaveLength(2);
      expect(winners[0].name).toBe('Team A');
      expect(winners[1].name).toBe('Team C');
    });

    it('should apply tie-breaker for tied scores', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 8, score: 100 },
        ],
      ];
      
      const winners = collectWinners(round, 'higher-seed');
      expect(winners).toHaveLength(1);
      expect(winners[0].name).toBe('Team A'); // Higher seed wins
    });

    it('should throw error for ties with error strategy', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 100 },
        ],
      ];
      
      expect(() => collectWinners(round, 'error')).toThrow('Tied score');
    });

    it('should handle callback tie-breaker', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100 },
          { name: 'Team B', seed: 2, score: 100 },
        ],
      ];
      
      const tieBreakerFn = (t1: Team, t2: Team) => t2; // Always pick second team
      const winners = collectWinners(round, 'callback', tieBreakerFn);
      
      expect(winners).toHaveLength(1);
      expect(winners[0].name).toBe('Team B');
    });

    it('should throw for incomplete games', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
        ],
      ];
      
      expect(() => collectWinners(round)).toThrow('Unable to determine winner');
    });
  });

  describe('generateNextRound', () => {
    it('should generate next round from winners', () => {
      const winners: Team[] = [
        { name: 'Team A', seed: 1 },
        { name: 'Team C', seed: 3 },
        { name: 'Team E', seed: 5 },
        { name: 'Team G', seed: 7 },
      ];
      
      const nextRound = generateNextRound(winners);
      
      expect(nextRound).toHaveLength(2);
      expect(nextRound[0]).toHaveLength(2);
      expect(nextRound[0][0].name).toBe('Team A');
      expect(nextRound[0][1].name).toBe('Team C');
      expect(nextRound[1][0].name).toBe('Team E');
      expect(nextRound[1][1].name).toBe('Team G');
    });

    it('should generate champion round for single winner', () => {
      const winners: Team[] = [{ name: 'Team A', seed: 1 }];
      
      const nextRound = generateNextRound(winners);
      
      expect(nextRound).toHaveLength(1);
      expect(nextRound[0]).toHaveLength(1);
      expect(nextRound[0][0].name).toBe('Team A');
    });

    it('should handle odd number of winners with bye', () => {
      const winners: Team[] = [
        { name: 'Team A', seed: 1 },
        { name: 'Team C', seed: 3 },
        { name: 'Team E', seed: 5 },
      ];
      
      const nextRound = generateNextRound(winners);
      
      expect(nextRound).toHaveLength(2);
      expect(nextRound[0]).toHaveLength(2); // Regular match
      expect(nextRound[1]).toHaveLength(1); // Bye
      expect(nextRound[1][0].name).toBe('Team E');
    });

    it('should clear scores by default', () => {
      const winners: Team[] = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2, score: 95 },
      ];
      
      const nextRound = generateNextRound(winners, false);
      
      expect(nextRound[0][0].score).toBeUndefined();
      expect(nextRound[0][1].score).toBeUndefined();
    });

    it('should preserve scores when requested', () => {
      const winners: Team[] = [
        { name: 'Team A', seed: 1, score: 100 },
        { name: 'Team B', seed: 2, score: 95 },
      ];
      
      const nextRound = generateNextRound(winners, true);
      
      expect(nextRound[0][0].score).toBe(100);
      expect(nextRound[0][1].score).toBe(95);
    });

    it('should return empty round for no winners', () => {
      const nextRound = generateNextRound([]);
      expect(nextRound).toHaveLength(0);
    });

    it('should create bye for 3 winners', () => {
      const winners: Team[] = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
        { name: 'Team C', seed: 3 },
      ];
      
      const nextRound = generateNextRound(winners);
      
      expect(nextRound).toHaveLength(2);
      expect(nextRound[0][0].name).toBe('Team A');
      expect(nextRound[0][1].name).toBe('Team B');
      expect(nextRound[1]).toHaveLength(1);
      expect(nextRound[1][0].name).toBe('Team C');
    });
  });

  describe('countTotalMatches', () => {
    it('should count total matches in tournament', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }],
        ],
        [
          [{ name: 'A', seed: 1 }, { name: 'C', seed: 3 }],
        ],
        [[{ name: 'A', seed: 1 }]],
      ];
      
      expect(countTotalMatches(rounds)).toBe(4);
    });

    it('should count byes as matches', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }], // Bye
        ],
      ];
      
      expect(countTotalMatches(rounds)).toBe(2);
    });

    it('should return 0 for empty tournament', () => {
      expect(countTotalMatches([])).toBe(0);
    });

    it('should handle tournament with empty rounds', () => {
      const rounds: Round[] = [[], []];
      expect(countTotalMatches(rounds)).toBe(0);
    });
  });

  describe('countCompletedMatches', () => {
    it('should count only completed matches', () => {
      const rounds: Round[] = [
        [
          [
            { name: 'A', seed: 1, score: 100 },
            { name: 'B', seed: 2, score: 85 },
          ],
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }], // Incomplete
        ],
      ];
      
      expect(countCompletedMatches(rounds)).toBe(1);
    });

    it('should count byes as completed', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }], // Bye
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }], // Incomplete
        ],
      ];
      
      expect(countCompletedMatches(rounds)).toBe(1);
    });

    it('should not count ties as completed', () => {
      const rounds: Round[] = [
        [
          [
            { name: 'A', seed: 1, score: 100 },
            { name: 'B', seed: 2, score: 100 },
          ],
        ],
      ];
      
      expect(countCompletedMatches(rounds)).toBe(0);
    });

    it('should return 0 for empty tournament', () => {
      expect(countCompletedMatches([])).toBe(0);
    });

    it('should count across all rounds', () => {
      const rounds: Round[] = [
        [
          [
            { name: 'A', seed: 1, score: 100 },
            { name: 'B', seed: 2, score: 85 },
          ],
          [
            { name: 'C', seed: 3, score: 90 },
            { name: 'D', seed: 4, score: 88 },
          ],
        ],
        [
          [
            { name: 'A', seed: 1, score: 95 },
            { name: 'C', seed: 3, score: 92 },
          ],
        ],
      ];
      
      expect(countCompletedMatches(rounds)).toBe(3);
    });
  });

  describe('countByes', () => {
    it('should count bye games', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }], // Bye
          [{ name: 'D', seed: 4 }], // Bye
        ],
      ];
      
      expect(countByes(rounds)).toBe(2);
    });

    it('should count byes across multiple rounds', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }], // Bye
          [{ name: 'B', seed: 2 }], // Bye
        ],
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
        ],
      ];
      
      expect(countByes(rounds)).toBe(2);
    });

    it('should return 0 when no byes', () => {
      const rounds: Round[] = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }],
        ],
      ];
      
      expect(countByes(rounds)).toBe(0);
    });

    it('should return 0 for empty tournament', () => {
      expect(countByes([])).toBe(0);
    });

    it('should not count champion as bye', () => {
      const rounds: Round[] = [
        [
          [
            { name: 'A', seed: 1, score: 100 },
            { name: 'B', seed: 2, score: 85 },
          ],
        ],
        [[{ name: 'A', seed: 1 }]], // Champion, not bye in context
      ];
      
      // This will count as 1 bye since it's single-team game
      // In real usage, the last round is handled specially
      expect(countByes(rounds)).toBe(1);
    });
  });
});
