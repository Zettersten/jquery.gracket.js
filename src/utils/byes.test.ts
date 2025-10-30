import { describe, it, expect } from 'vitest';
import {
  calculateByesNeeded,
  generateTournamentWithByes,
  tournamentHasByes,
  getByeTeams,
} from './byes';
import type { Team, Round } from '../types';

describe('byes utilities', () => {
  describe('calculateByesNeeded', () => {
    it('should calculate byes for non-power-of-2 counts', () => {
      expect(calculateByesNeeded(3)).toBe(1);  // 4 - 3 = 1
      expect(calculateByesNeeded(5)).toBe(3);  // 8 - 5 = 3
      expect(calculateByesNeeded(6)).toBe(2);  // 8 - 6 = 2
      expect(calculateByesNeeded(7)).toBe(1);  // 8 - 7 = 1
      expect(calculateByesNeeded(9)).toBe(7);  // 16 - 9 = 7
      expect(calculateByesNeeded(10)).toBe(6); // 16 - 10 = 6
    });

    it('should return 0 for power-of-2 counts', () => {
      expect(calculateByesNeeded(2)).toBe(0);
      expect(calculateByesNeeded(4)).toBe(0);
      expect(calculateByesNeeded(8)).toBe(0);
      expect(calculateByesNeeded(16)).toBe(0);
      expect(calculateByesNeeded(32)).toBe(0);
    });

    it('should throw for less than 2 teams', () => {
      expect(() => calculateByesNeeded(0)).toThrow('at least 2 teams');
      expect(() => calculateByesNeeded(1)).toThrow('at least 2 teams');
    });

    it('should handle large team counts', () => {
      expect(calculateByesNeeded(50)).toBe(14); // 64 - 50 = 14
      expect(calculateByesNeeded(100)).toBe(28); // 128 - 100 = 28
    });
  });

  describe('generateTournamentWithByes - top-seeds strategy', () => {
    it('should generate tournament for 6 teams with top-seed byes', () => {
      const teams: Team[] = [
        { name: 'Team 1', seed: 1, id: 't1' },
        { name: 'Team 2', seed: 2, id: 't2' },
        { name: 'Team 3', seed: 3, id: 't3' },
        { name: 'Team 4', seed: 4, id: 't4' },
        { name: 'Team 5', seed: 5, id: 't5' },
        { name: 'Team 6', seed: 6, id: 't6' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // Should have first round with 2 matches + 2 byes
      expect(tournament).toHaveLength(4); // R1, R2, R3, Champion
      
      const firstRound = tournament[0];
      expect(firstRound).toHaveLength(4); // 2 matches + 2 byes
      
      // Count byes in first round
      const byeGames = firstRound.filter(game => game.length === 1);
      expect(byeGames).toHaveLength(2);
      
      // Check that top seeds got byes
      const byeTeamSeeds = byeGames.map(game => game[0].seed).sort();
      expect(byeTeamSeeds).toEqual([1, 2]);
    });

    it('should generate tournament for 5 teams', () => {
      const teams: Team[] = Array.from({ length: 5 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      const firstRound = tournament[0];
      const byeGames = firstRound.filter(game => game.length === 1);
      
      // 5 teams → need 3 byes (to make 8)
      expect(byeGames).toHaveLength(3);
      
      // Top 3 seeds should get byes
      const byeSeeds = byeGames.map(g => g[0].seed).sort();
      expect(byeSeeds).toEqual([1, 2, 3]);
    });

    it('should generate tournament for 7 teams', () => {
      const teams: Team[] = Array.from({ length: 7 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      const firstRound = tournament[0];
      const byeGames = firstRound.filter(game => game.length === 1);
      
      // 7 teams → need 1 bye
      expect(byeGames).toHaveLength(1);
      expect(byeGames[0][0].seed).toBe(1); // Top seed gets bye
    });

    it('should generate proper subsequent rounds', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 6 teams → 8 bracket → 4 teams in R1
      expect(tournament[0]).toHaveLength(4); // 2 matches + 2 byes = 4 games
      
      // Round 2 should have 2 matches (4 teams total)
      expect(tournament[1]).toHaveLength(2);
      
      // Round 3 (finals) should have 1 match
      expect(tournament[2]).toHaveLength(1);
      
      // Champion round
      expect(tournament[3]).toHaveLength(1);
      expect(tournament[3][0]).toHaveLength(1);
    });

    it('should handle power-of-2 teams (no byes)', () => {
      const teams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // No byes needed for power of 2
      const firstRound = tournament[0];
      const byeGames = firstRound.filter(game => game.length === 1);
      expect(byeGames).toHaveLength(0);
      
      // All games should be regular matches
      expect(firstRound.every(game => game.length === 2)).toBe(true);
    });
  });

  describe('generateTournamentWithByes - random strategy', () => {
    it('should generate tournament with random byes', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'random');
      
      // Should still have correct structure
      const firstRound = tournament[0];
      const byeGames = firstRound.filter(game => game.length === 1);
      expect(byeGames).toHaveLength(2);
      
      // All teams should be present
      const allTeamsInRound = firstRound.flatMap(game => game);
      expect(allTeamsInRound).toHaveLength(6);
    });

    it('should generate different results each time (probabilistic)', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      // Generate multiple tournaments
      const results = Array.from({ length: 10 }, () => 
        generateTournamentWithByes(teams, 'random')
      );
      
      // Extract bye team IDs from each
      const byeSetups = results.map(tournament => {
        const firstRound = tournament[0];
        const byeGames = firstRound.filter(game => game.length === 1);
        return byeGames.map(g => g[0].id).sort().join(',');
      });
      
      // Should have some variation (not all identical)
      const uniqueSetups = new Set(byeSetups);
      // This might occasionally fail due to randomness, but very unlikely
      expect(uniqueSetups.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateTournamentWithByes - edge cases', () => {
    it('should throw for less than 2 teams', () => {
      expect(() => {
        generateTournamentWithByes([], 'top-seeds');
      }).toThrow('at least 2 teams');
      
      expect(() => {
        generateTournamentWithByes([{ name: 'Only Team', seed: 1 }], 'top-seeds');
      }).toThrow('at least 2 teams');
    });

    it('should handle 2 teams (smallest tournament)', () => {
      const teams: Team[] = [
        { name: 'Team 1', seed: 1, id: 't1' },
        { name: 'Team 2', seed: 2, id: 't2' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 2 teams = power of 2, no byes
      expect(tournament[0]).toHaveLength(1); // Single match
      expect(tournament[0][0]).toHaveLength(2);
    });

    it('should handle 3 teams (1 bye)', () => {
      const teams: Team[] = [
        { name: 'Team 1', seed: 1, id: 't1' },
        { name: 'Team 2', seed: 2, id: 't2' },
        { name: 'Team 3', seed: 3, id: 't3' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      const firstRound = tournament[0];
      const byeGames = firstRound.filter(game => game.length === 1);
      
      expect(byeGames).toHaveLength(1);
      expect(byeGames[0][0].seed).toBe(1); // Top seed gets bye
    });

    it('should throw for custom strategy', () => {
      const teams: Team[] = [
        { name: 'Team 1', seed: 1 },
        { name: 'Team 2', seed: 2 },
        { name: 'Team 3', seed: 3 },
      ];
      
      expect(() => {
        generateTournamentWithByes(teams, 'custom');
      }).toThrow('Custom bye strategy not implemented');
    });

    it('should handle unsorted teams', () => {
      const teams: Team[] = [
        { name: 'Team 8', seed: 8, id: 't8' },
        { name: 'Team 1', seed: 1, id: 't1' },
        { name: 'Team 5', seed: 5, id: 't5' },
        { name: 'Team 3', seed: 3, id: 't3' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // Should still work correctly
      expect(tournament).toBeDefined();
      expect(tournament[0]).toBeDefined();
    });
  });

  describe('tournamentHasByes', () => {
    it('should return true for tournament with byes', () => {
      const tournament = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }], // Bye
        ],
      ];
      
      expect(tournamentHasByes(tournament)).toBe(true);
    });

    it('should return false for tournament without byes', () => {
      const tournament = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }],
        ],
      ];
      
      expect(tournamentHasByes(tournament)).toBe(false);
    });

    it('should detect byes in any round', () => {
      const tournament = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
          [{ name: 'C', seed: 3 }, { name: 'D', seed: 4 }],
        ],
        [
          [{ name: 'A', seed: 1 }, { name: 'C', seed: 3 }],
          [{ name: 'E', seed: 5 }], // Bye in round 2
        ],
      ];
      
      expect(tournamentHasByes(tournament)).toBe(true);
    });

    it('should return false for empty tournament', () => {
      expect(tournamentHasByes([])).toBe(false);
    });

    it('should handle champion as special case', () => {
      const tournament = [
        [
          [{ name: 'A', seed: 1 }, { name: 'B', seed: 2 }],
        ],
        [[{ name: 'A', seed: 1 }]], // Champion (single team)
      ];
      
      // This will return true since technically it's a single-team game
      expect(tournamentHasByes(tournament)).toBe(true);
    });
  });

  describe('getByeTeams', () => {
    it('should return teams with byes in a round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
        ],
        [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
        [{ name: 'Team D', seed: 4, id: 'd' }], // Bye
      ];
      
      const byeTeams = getByeTeams(round);
      
      expect(byeTeams).toHaveLength(2);
      expect(byeTeams[0].name).toBe('Team C');
      expect(byeTeams[1].name).toBe('Team D');
    });

    it('should return empty array when no byes', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1 },
          { name: 'Team B', seed: 2 },
        ],
        [
          { name: 'Team C', seed: 3 },
          { name: 'Team D', seed: 4 },
        ],
      ];
      
      expect(getByeTeams(round)).toHaveLength(0);
    });

    it('should return all teams when all are byes', () => {
      const round: Round = [
        [{ name: 'Team A', seed: 1 }],
        [{ name: 'Team B', seed: 2 }],
        [{ name: 'Team C', seed: 3 }],
      ];
      
      const byeTeams = getByeTeams(round);
      expect(byeTeams).toHaveLength(3);
    });

    it('should return empty array for empty round', () => {
      expect(getByeTeams([])).toHaveLength(0);
    });
  });

  describe('generateTournamentWithByes - complete tournament structure', () => {
    it('should generate correct structure for 5-team tournament', () => {
      const teams: Team[] = Array.from({ length: 5 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 5 teams → need 3 byes → 8-team bracket
      expect(tournament).toHaveLength(4); // R1, R2, R3, Champion
      
      // Round 1: 1 match (2 teams) + 3 byes
      const r1 = tournament[0];
      expect(r1).toHaveLength(4);
      expect(r1.filter(g => g.length === 1)).toHaveLength(3); // 3 byes
      expect(r1.filter(g => g.length === 2)).toHaveLength(1); // 1 match
      
      // Round 2: 2 matches (4 teams total)
      expect(tournament[1]).toHaveLength(2);
      
      // Round 3: 1 match (2 teams)
      expect(tournament[2]).toHaveLength(1);
      expect(tournament[2][0]).toHaveLength(2);
      
      // Champion
      expect(tournament[3]).toHaveLength(1);
      expect(tournament[3][0]).toHaveLength(1);
    });

    it('should generate correct structure for 10-team tournament', () => {
      const teams: Team[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 10 teams → need 6 byes → 16-team bracket
      const r1 = tournament[0];
      const byeGames = r1.filter(g => g.length === 1);
      
      expect(byeGames).toHaveLength(6);
      
      // Top 6 seeds get byes
      const byeSeeds = byeGames.map(g => g[0].seed).sort((a, b) => a - b);
      expect(byeSeeds).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should generate all placeholder rounds', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // Each round should have placeholder teams with IDs
      tournament.forEach((round, rIdx) => {
        round.forEach((game, gIdx) => {
          game.forEach(team => {
            expect(team.name).toBeDefined();
            expect(team.seed).toBeDefined();
            expect(team.id).toBeDefined();
          });
        });
      });
    });

    it('should maintain all original teams', () => {
      const teams: Team[] = [
        { name: 'Warriors', seed: 1, id: 'warriors' },
        { name: 'Lakers', seed: 2, id: 'lakers' },
        { name: 'Celtics', seed: 3, id: 'celtics' },
        { name: 'Heat', seed: 4, id: 'heat' },
        { name: 'Bucks', seed: 5, id: 'bucks' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // Extract all team IDs from first round
      const firstRoundTeamIds = tournament[0]
        .flatMap(game => game)
        .map(team => team.id);
      
      // All original teams should be present
      teams.forEach(team => {
        expect(firstRoundTeamIds).toContain(team.id);
      });
    });
  });

  describe('generateTournamentWithByes - different team counts', () => {
    // Test various team counts
    [3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15].forEach(count => {
      it(`should generate valid tournament for ${count} teams`, () => {
        const teams: Team[] = Array.from({ length: count }, (_, i) => ({
          name: `Team ${i + 1}`,
          seed: i + 1,
          id: `t${i + 1}`,
        }));
        
        const tournament = generateTournamentWithByes(teams, 'top-seeds');
        
        // Should have valid structure
        expect(tournament.length).toBeGreaterThan(0);
        
        // First round should have all teams
        const firstRoundTeams = tournament[0].flatMap(g => g);
        expect(firstRoundTeams).toHaveLength(count);
        
        // Calculate expected byes
        const nextPower = Math.pow(2, Math.ceil(Math.log2(count)));
        const expectedByes = nextPower - count;
        
        const byeGames = tournament[0].filter(g => g.length === 1);
        expect(byeGames).toHaveLength(expectedByes);
      });
    });
  });

  describe('generateTournamentWithByes - seeding order', () => {
    it('should respect seed order for top-seeds strategy', () => {
      const teams: Team[] = [
        { name: 'Team C', seed: 3, id: 'c' },
        { name: 'Team A', seed: 1, id: 'a' },
        { name: 'Team B', seed: 2, id: 'b' },
        { name: 'Team D', seed: 4, id: 'd' },
        { name: 'Team E', seed: 5, id: 'e' },
        { name: 'Team F', seed: 6, id: 'f' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      const byeGames = tournament[0].filter(g => g.length === 1);
      const byeSeeds = byeGames.map(g => g[0].seed).sort((a, b) => a - b);
      
      // Seeds 1 and 2 should get byes
      expect(byeSeeds).toEqual([1, 2]);
    });

    it('should work with non-sequential seeds', () => {
      const teams: Team[] = [
        { name: 'Team A', seed: 1, id: 'a' },
        { name: 'Team B', seed: 4, id: 'b' },
        { name: 'Team C', seed: 7, id: 'c' },
        { name: 'Team D', seed: 10, id: 'd' },
        { name: 'Team E', seed: 13, id: 'e' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      const byeGames = tournament[0].filter(g => g.length === 1);
      const byeSeeds = byeGames.map(g => g[0].seed).sort((a, b) => a - b);
      
      // Seeds 1, 4, and 7 should get byes (lowest 3)
      expect(byeSeeds).toEqual([1, 4, 7]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle teams with same seed', () => {
      const teams: Team[] = [
        { name: 'Team A', seed: 1, id: 'a' },
        { name: 'Team B', seed: 1, id: 'b' },
        { name: 'Team C', seed: 1, id: 'c' },
      ];
      
      // Should not throw
      expect(() => {
        generateTournamentWithByes(teams, 'top-seeds');
      }).not.toThrow();
    });

    it('should handle teams without IDs', () => {
      const teams: Team[] = [
        { name: 'Team A', seed: 1 },
        { name: 'Team B', seed: 2 },
        { name: 'Team C', seed: 3 },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      expect(tournament).toBeDefined();
    });

    it('should handle teams with displaySeed', () => {
      const teams: Team[] = [
        { name: 'Team A', seed: 1, displaySeed: 'A1' },
        { name: 'Team B', seed: 2, displaySeed: 'B2' },
        { name: 'Team C', seed: 3, displaySeed: 'C3' },
      ];
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      expect(tournament).toBeDefined();
      
      // Check that displaySeed is preserved
      const firstTeam = tournament[0][0][0];
      if ('displaySeed' in firstTeam) {
        expect(firstTeam.displaySeed).toBeDefined();
      }
    });
  });

  describe('generateTournamentWithByes - large tournaments', () => {
    it('should handle 50 teams', () => {
      const teams: Team[] = Array.from({ length: 50 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 50 teams → 64 bracket → 14 byes
      const byeGames = tournament[0].filter(g => g.length === 1);
      expect(byeGames).toHaveLength(14);
      
      // Top 14 seeds get byes
      const byeSeeds = byeGames.map(g => g[0].seed).sort((a, b) => a - b);
      expect(byeSeeds).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    });

    it('should generate correct number of rounds for 50 teams', () => {
      const teams: Team[] = Array.from({ length: 50 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'top-seeds');
      
      // 64-team bracket = 6 rounds + champion = 7 total
      expect(tournament).toHaveLength(7);
    });
  });

  describe('random strategy behavior', () => {
    it('should still assign correct number of byes', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      // Run multiple times to verify consistency
      for (let i = 0; i < 10; i++) {
        const tournament = generateTournamentWithByes(teams, 'random');
        const byeGames = tournament[0].filter(g => g.length === 1);
        expect(byeGames).toHaveLength(2); // Always 2 byes
      }
    });

    it('should include all teams in first round', () => {
      const teams: Team[] = Array.from({ length: 7 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
      }));
      
      const tournament = generateTournamentWithByes(teams, 'random');
      const firstRoundTeams = tournament[0].flatMap(g => g);
      
      expect(firstRoundTeams).toHaveLength(7);
      
      // All original team IDs should be present
      const originalIds = teams.map(t => t.id);
      const firstRoundIds = firstRoundTeams.map(t => t.id);
      
      originalIds.forEach(id => {
        expect(firstRoundIds).toContain(id);
      });
    });
  });
});
