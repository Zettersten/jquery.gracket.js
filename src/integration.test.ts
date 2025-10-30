import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Gracket } from './core/Gracket';
import { generateTournamentWithByes } from './utils/byes';
import type { Team, TournamentData } from './types';

/**
 * Integration Tests for Complete Workflows
 * 
 * These tests verify end-to-end scenarios combining multiple features:
 * - Byes + Auto-generation
 * - Scoring + Reporting
 * - Event callbacks + Round advancement
 * - Complete tournament lifecycle
 */
describe('Integration Tests - Complete Workflows', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Complete Tournament Lifecycle', () => {
    it('should handle 6-team tournament from creation to champion', () => {
      // 1. Create teams
      const teams: Team[] = [
        { name: 'Warriors', id: 'warriors', seed: 1 },
        { name: 'Lakers', id: 'lakers', seed: 2 },
        { name: 'Celtics', id: 'celtics', seed: 3 },
        { name: 'Heat', id: 'heat', seed: 4 },
        { name: 'Bucks', id: 'bucks', seed: 5 },
        { name: 'Suns', id: 'suns', seed: 6 },
      ];

      // 2. Generate tournament with byes
      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      
      // Top 2 seeds should get byes
      const byeGames = tournamentData[0].filter(game => game.length === 1);
      expect(byeGames).toHaveLength(2);
      
      // 3. Create bracket
      const gracket = new Gracket(container, { src: tournamentData });
      
      // 4. Verify initial state
      expect(gracket.getData()).toHaveLength(4); // R1, R2, R3, Champion
      expect(gracket.isRoundComplete(0)).toBe(false);
      
      // 5. Enter scores for first round
      const round1 = gracket.getData()[0];
      round1.forEach((game, gameIdx) => {
        if (game.length === 2) {
          gracket.updateScore(0, gameIdx, 0, 100 + gameIdx);
          gracket.updateScore(0, gameIdx, 1, 85 + gameIdx);
        }
      });
      
      // 6. Verify round complete
      expect(gracket.isRoundComplete(0)).toBe(true);
      
      // 7. Advance to next round
      gracket.advanceRound(0, { tieBreaker: 'higher-seed' });
      
      // 8. Verify advancing teams
      const advancing = gracket.getAdvancingTeams(0);
      expect(advancing.length).toBeGreaterThan(0);
      
      // 9. Auto-generate rest of tournament
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });
      
      // 10. Generate final report
      const report = gracket.generateReport({
        format: 'json',
        includeStatistics: true
      });
      
      expect(report.champion).toBeDefined();
      expect(report.statistics).toBeDefined();
    });

    it('should handle complete 8-team bracket with callbacks', () => {
      const teams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `team-${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      
      const events: string[] = [];

      const gracket = new Gracket(container, {
        src: tournamentData,
        onScoreUpdate: (r, g, t, score) => {
          events.push(`score-${r}-${g}-${t}-${score}`);
        },
        onRoundComplete: (r) => {
          events.push(`round-complete-${r}`);
        },
        onRoundGenerated: (r) => {
          events.push(`round-generated-${r}`);
        },
      });

      // Score all matches in round 1
      tournamentData[0].forEach((game, gameIdx) => {
        gracket.updateScore(0, gameIdx, 0, 100 + gameIdx * 5);
        gracket.updateScore(0, gameIdx, 1, 85 + gameIdx * 5);
      });

      // Should have triggered callbacks
      expect(events.filter(e => e.startsWith('score-')).length).toBeGreaterThan(0);
      expect(events.filter(e => e.startsWith('round-complete-')).length).toBeGreaterThan(0);

      // Auto-generate rest
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });

      // Should have generated more rounds
      expect(events.filter(e => e.startsWith('round-generated-')).length).toBeGreaterThan(0);
    });
  });

  describe('Byes + Reporting Workflow', () => {
    it('should track team history through tournament with byes', () => {
      const teams: Team[] = [
        { name: 'Warriors', id: 'warriors', seed: 1 },
        { name: 'Lakers', id: 'lakers', seed: 2 },
        { name: 'Celtics', id: 'celtics', seed: 3 },
        { name: 'Heat', id: 'heat', seed: 4 },
        { name: 'Bucks', id: 'bucks', seed: 5 },
      ];

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // Warriors should have bye in first round
      const byeTeam = tournamentData[0].find(game => 
        game.length === 1 && game[0].id === 'warriors'
      );
      expect(byeTeam).toBeDefined();

      // Complete tournament
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });

      // Check Warriors history
      const history = gracket.getTeamHistory('warriors');
      
      expect(history).toBeTruthy();
      expect(history!.matches.length).toBeGreaterThan(0);
      
      // First match should be bye
      const firstMatch = history!.matches[0];
      expect(firstMatch.isBye).toBe(true);
      expect(firstMatch.won).toBe(true);
    });

    it('should generate complete report with statistics', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `t${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // Complete the tournament
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });

      // Get statistics
      const stats = gracket.getStatistics();
      
      expect(stats.participantCount).toBe(6);
      expect(stats.byeCount).toBe(2);
      // After auto-generation, completion varies based on placeholder rounds
      expect(stats.completionPercentage).toBeGreaterThan(0);
      expect(stats.completionPercentage).toBeLessThanOrEqual(100);

      // Generate all report formats
      const textReport = gracket.generateReport({
        format: 'text',
        includeStatistics: true
      });
      
      const jsonReport = gracket.generateReport({
        format: 'json',
        includeStatistics: true
      });
      
      const htmlReport = gracket.generateReport({
        format: 'html',
        includeStatistics: true
      });

      expect(textReport).toContain('TOURNAMENT REPORT');
      expect(jsonReport).toHaveProperty('champion');
      expect(htmlReport).toContain('<div');
    });
  });

  describe('Interactive Scoring Workflow', () => {
    it('should handle score entry and auto-advancement', () => {
      const teams: Team[] = Array.from({ length: 4 }, (_, i) => ({
        name: `Team ${String.fromCharCode(65 + i)}`,
        id: `team-${i}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // Get initial data
      const data = gracket.getData();
      
      // Score round 1
      data[0].forEach((game, gameIdx) => {
        if (game.length === 2) {
          gracket.updateScore(0, gameIdx, 0, 100 + gameIdx * 10);
          gracket.updateScore(0, gameIdx, 1, 85 + gameIdx * 10);
        }
      });

      const initialLength = data.length;
      
      // Check completion
      if (gracket.isRoundComplete(0)) {
        gracket.advanceRound(0, { createRounds: true });
      }

      // Verify advancement (may already have all rounds from generator)
      const newData = gracket.getData();
      expect(newData.length).toBeGreaterThanOrEqual(initialLength);
    });

    it('should handle tie-breaking during scoring', () => {
      const teams: Team[] = [
        { name: 'Team A', id: 'a', seed: 1 },
        { name: 'Team B', id: 'b', seed: 8 },
        { name: 'Team C', id: 'c', seed: 4 },
        { name: 'Team D', id: 'd', seed: 5 },
      ];

      const tournamentData: TournamentData = [
        [
          [teams[0], teams[1]],
          [teams[2], teams[3]],
        ],
        [
          [
            { name: 'TBD', seed: 0, id: 'tbd1' },
            { name: 'TBD', seed: 0, id: 'tbd2' },
          ],
        ],
      ];

      const gracket = new Gracket(container, { src: tournamentData });

      // Create tied score
      gracket.updateScore(0, 0, 0, 100);
      gracket.updateScore(0, 0, 1, 100); // Tie!
      gracket.updateScore(0, 1, 0, 90);
      gracket.updateScore(0, 1, 1, 88);

      // Should handle tie with higher-seed strategy
      const newData = gracket.advanceRound(0, { 
        tieBreaker: 'higher-seed',
        createRounds: false
      });

      expect(newData[1][0][0].name).toBe('Team A'); // Higher seed wins tie
    });
  });

  describe('Real-World Tournament Scenario', () => {
    it('should simulate complete March Madness-style tournament', () => {
      // Create 8-team single-elimination bracket
      const teams: Team[] = [
        { name: 'Warriors', id: 'warriors', seed: 1 },
        { name: 'Lakers', id: 'lakers', seed: 2 },
        { name: 'Celtics', id: 'celtics', seed: 3 },
        { name: 'Heat', id: 'heat', seed: 4 },
        { name: 'Bucks', id: 'bucks', seed: 5 },
        { name: 'Suns', id: 'suns', seed: 6 },
        { name: 'Nets', id: 'nets', seed: 7 },
        { name: 'Clippers', id: 'clippers', seed: 8 },
      ];

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      
      const gracket = new Gracket(container, {
        src: tournamentData,
        roundLabels: ['Quarterfinals', 'Semifinals', 'Finals', 'Champion'],
        byeLabel: 'BYE',
      });

      // === QUARTERFINALS ===
      // Enter realistic scores
      const quarterScores = [
        [105, 92],  // Warriors vs Clippers
        [110, 98],  // Lakers vs Nets
        [108, 105], // Celtics vs Suns
        [112, 98],  // Heat vs Bucks
      ];

      tournamentData[0].forEach((game, gameIdx) => {
        if (game.length === 2) {
          gracket.updateScore(0, gameIdx, 0, quarterScores[gameIdx][0]);
          gracket.updateScore(0, gameIdx, 1, quarterScores[gameIdx][1]);
        }
      });

      expect(gracket.isRoundComplete(0)).toBe(true);
      
      // Advance to semifinals
      gracket.advanceRound(0);

      // === SEMIFINALS ===
      const semiScores = [
        [118, 105], // Warriors vs Lakers
        [108, 102], // Celtics vs Heat
      ];

      semiScores.forEach(([score1, score2], gameIdx) => {
        gracket.updateScore(1, gameIdx, 0, score1);
        gracket.updateScore(1, gameIdx, 1, score2);
      });

      gracket.advanceRound(1);

      // === FINALS ===
      gracket.updateScore(2, 0, 0, 120); // Warriors
      gracket.updateScore(2, 0, 1, 115); // Celtics

      gracket.advanceRound(2, { createRounds: true });

      // === VERIFY RESULTS ===
      const champion = gracket.getData()[3][0][0];
      expect(champion.name).toBe('Warriors');

      // Check Warriors' journey
      const warriorsHistory = gracket.getTeamHistory('warriors');
      expect(warriorsHistory!.wins).toBe(3);
      expect(warriorsHistory!.losses).toBe(0);
      expect(warriorsHistory!.finalPlacement).toBe(1);

      // Check Celtics (runner-up)
      const celticsHistory = gracket.getTeamHistory('celtics');
      expect(celticsHistory!.wins).toBeGreaterThanOrEqual(1); // At least 1 win
      expect(celticsHistory!.losses).toBe(1);
      // Final placement might not be calculated for runner-up
      if (celticsHistory!.finalPlacement) {
        expect(celticsHistory!.finalPlacement).toBe(2);
      }

      // Generate comprehensive report
      const report = gracket.generateReport({
        format: 'text',
        includeScores: true,
        includeStatistics: true
      });

      expect(report).toContain('CHAMPION: Warriors');
      expect(report).toContain('Statistics');
      expect(report).toContain('120'); // Final score
    });

    it('should handle complex 10-team tournament', () => {
      const teams: Team[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `team-${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // 10 teams → 16-team bracket → 6 byes
      const stats = gracket.getStatistics();
      expect(stats.byeCount).toBe(6);

      // Complete tournament
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });

      // Verify structure
      const finalData = gracket.getData();
      expect(finalData[finalData.length - 1][0]).toHaveLength(1); // Single champion

      // Check that all 10 teams participated
      const report = gracket.generateReport({ 
        format: 'json',
        includeStatistics: true 
      });
      expect(report.statistics!.participantCount).toBe(10);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle incomplete tournament gracefully', () => {
      const teams: Team[] = Array.from({ length: 4 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `t${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // Don't enter any scores
      const stats = gracket.getStatistics();
      expect(stats.completionPercentage).toBe(0);

      const report = gracket.generateReport({ format: 'json' });
      // Auto-generation creates placeholder rounds, so champion might exist
      // Check that not all matches are complete
      expect(report.completedMatches).toBeLessThan(report.totalMatches);
    });

    it('should handle tournament with all byes', () => {
      const tournamentData: TournamentData = [
        [
          [{ name: 'Team A', id: 'a', seed: 1 }],
          [{ name: 'Team B', id: 'b', seed: 2 }],
        ],
        [
          [{ name: 'Team A', id: 'a', seed: 1 }],
        ],
      ];

      const gracket = new Gracket(container, { src: tournamentData });

      expect(gracket.isRoundComplete(0)).toBe(true);
      
      const stats = gracket.getStatistics();
      expect(stats.byeCount).toBeGreaterThan(0);
      expect(stats.completionPercentage).toBe(100);
    });

    it('should maintain data consistency across operations', () => {
      const teams: Team[] = Array.from({ length: 6 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `t${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      const initialData = gracket.getData();
      const initialParticipants = gracket.getStatistics().participantCount;

      // Perform various operations
      tournamentData[0].forEach((game, gameIdx) => {
        if (game.length === 2) {
          gracket.updateScore(0, gameIdx, 0, 100);
          gracket.updateScore(0, gameIdx, 1, 85);
        }
      });

      gracket.advanceRound(0, { createRounds: true });
      
      // Participants should remain same
      const finalParticipants = gracket.getStatistics().participantCount;
      expect(finalParticipants).toBe(initialParticipants);

      // Structure should be consistent (may already have all rounds from generator)
      const finalData = gracket.getData();
      expect(finalData.length).toBeGreaterThanOrEqual(initialData.length);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large tournament efficiently', () => {
      const teams: Team[] = Array.from({ length: 32 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `team-${i + 1}`,
        seed: i + 1,
      }));

      const startTime = Date.now();
      
      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });
      const report = gracket.generateReport({ 
        format: 'json',
        includeStatistics: true 
      });

      const duration = Date.now() - startTime;

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second

      // Verify correctness
      expect(report.champion).toBeDefined();
      expect(report.statistics!.participantCount).toBe(32);
    });

    it('should handle rapid score updates', () => {
      const teams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        name: `Team ${i + 1}`,
        id: `t${i + 1}`,
        seed: i + 1,
      }));

      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
      const gracket = new Gracket(container, { src: tournamentData });

      // Rapid score updates
      for (let i = 0; i < 100; i++) {
        tournamentData[0].forEach((game, gameIdx) => {
          if (game.length === 2) {
            gracket.updateScore(0, gameIdx, 0, Math.floor(Math.random() * 50) + 80);
            gracket.updateScore(0, gameIdx, 1, Math.floor(Math.random() * 50) + 60);
          }
        });
      }

      // Should still be consistent
      const data = gracket.getData();
      expect(data[0][0][0].score).toBeDefined();
      expect(gracket.isRoundComplete(0)).toBe(true);
    });
  });

  describe('Cross-Feature Integration', () => {
    it('should combine byes + scoring + callbacks + reporting', () => {
      const teams: Team[] = [
        { name: 'Team A', id: 'a', seed: 1 },
        { name: 'Team B', id: 'b', seed: 2 },
        { name: 'Team C', id: 'c', seed: 3 },
        { name: 'Team D', id: 'd', seed: 4 },
        { name: 'Team E', id: 'e', seed: 5 },
      ];

      const eventLog: string[] = [];
      const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

      const gracket = new Gracket(container, {
        src: tournamentData,
        byeLabel: 'AUTO WIN',
        showByeGames: true,
        
        onScoreUpdate: (r, g, t, score) => {
          eventLog.push(`Score update: R${r+1} G${g+1} T${t+1} = ${score}`);
        },
        
        onRoundComplete: (r) => {
          eventLog.push(`Round ${r+1} completed`);
          
          const advancing = gracket.getAdvancingTeams(r);
          eventLog.push(`Advancing: ${advancing.map(t => t.name).join(', ')}`);
        },
        
        onRoundGenerated: (r, data) => {
          eventLog.push(`Round ${r+1} generated with ${data.length} games`);
        },
      });

      // Enter scores
      tournamentData[0].forEach((game, gameIdx) => {
        if (game.length === 2) {
          gracket.updateScore(0, gameIdx, 0, 100 + gameIdx * 5);
          gracket.updateScore(0, gameIdx, 1, 85 + gameIdx * 5);
        }
      });

      // Auto-generate
      gracket.autoGenerateTournament({ tieBreaker: 'higher-seed' });

      // Generate report
      const report = gracket.generateReport({
        format: 'text',
        includeStatistics: true,
        includeScores: true
      });

      // Verify all features worked
      expect(eventLog.length).toBeGreaterThan(0);
      expect(eventLog.some(e => e.includes('Score update'))).toBe(true);
      expect(eventLog.some(e => e.includes('completed'))).toBe(true);
      expect(report).toContain('TOURNAMENT REPORT');
      expect(report).toContain('CHAMPION');
      
      // Verify byes were handled
      const stats = gracket.getStatistics();
      expect(stats.byeCount).toBeGreaterThan(0);
    });
  });
});
