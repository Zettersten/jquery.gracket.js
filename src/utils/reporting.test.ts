import { describe, it, expect } from 'vitest';
import {
  getAdvancingTeams,
  getGameResult,
  getRoundResults,
  buildTeamHistory,
  generateTournamentReport,
  calculateStatistics,
  formatReportAsText,
  formatReportAsMarkdown,
  formatReportAsHTML,
} from './reporting';
import type { Round, Game, TournamentData, Team } from '../types';

describe('reporting utilities', () => {
  describe('getAdvancingTeams', () => {
    it('should get winners from complete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, score: 90, id: 'c' },
          { name: 'Team D', seed: 4, score: 88, id: 'd' },
        ],
      ];
      
      const advancing = getAdvancingTeams(round);
      
      expect(advancing).toHaveLength(2);
      expect(advancing[0].name).toBe('Team A');
      expect(advancing[1].name).toBe('Team C');
    });

    it('should include bye teams in advancing', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
      ];
      
      const advancing = getAdvancingTeams(round);
      
      expect(advancing).toHaveLength(2);
      expect(advancing[0].name).toBe('Team A');
      expect(advancing[1].name).toBe('Team C');
    });

    it('should return only completed matches', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, id: 'c' },
          { name: 'Team D', seed: 4, id: 'd' },
        ], // Incomplete
      ];
      
      const advancing = getAdvancingTeams(round);
      
      expect(advancing).toHaveLength(1);
      expect(advancing[0].name).toBe('Team A');
    });

    it('should return empty array for incomplete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, id: 'a' },
          { name: 'Team B', seed: 2, id: 'b' },
        ],
      ];
      
      expect(getAdvancingTeams(round)).toHaveLength(0);
    });

    it('should handle all byes', () => {
      const round: Round = [
        [{ name: 'Team A', seed: 1, id: 'a' }],
        [{ name: 'Team B', seed: 2, id: 'b' }],
      ];
      
      const advancing = getAdvancingTeams(round);
      expect(advancing).toHaveLength(2);
    });
  });

  describe('getGameResult', () => {
    it('should return result for completed match', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100, id: 'a' },
        { name: 'Team B', seed: 2, score: 85, id: 'b' },
      ];
      
      const result = getGameResult(game);
      
      expect(result).toBeTruthy();
      expect(result!.winner.name).toBe('Team A');
      expect(result!.loser!.name).toBe('Team B');
      expect(result!.winnerScore).toBe(100);
      expect(result!.loserScore).toBe(85);
      expect(result!.isBye).toBe(false);
    });

    it('should return result for bye game', () => {
      const game: Game = [{ name: 'Team A', seed: 1, id: 'a' }];
      
      const result = getGameResult(game);
      
      expect(result).toBeTruthy();
      expect(result!.winner.name).toBe('Team A');
      expect(result!.loser).toBeNull();
      expect(result!.isBye).toBe(true);
    });

    it('should return null for incomplete match', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, id: 'a' },
        { name: 'Team B', seed: 2, id: 'b' },
      ];
      
      expect(getGameResult(game)).toBeNull();
    });

    it('should return null for tied match', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 100, id: 'a' },
        { name: 'Team B', seed: 2, score: 100, id: 'b' },
      ];
      
      expect(getGameResult(game)).toBeNull();
    });

    it('should handle team 2 winning', () => {
      const game: Game = [
        { name: 'Team A', seed: 1, score: 85, id: 'a' },
        { name: 'Team B', seed: 2, score: 100, id: 'b' },
      ];
      
      const result = getGameResult(game);
      
      expect(result!.winner.name).toBe('Team B');
      expect(result!.loser!.name).toBe('Team A');
    });

    it('should return null for invalid game', () => {
      const game: Game = [];
      expect(getGameResult(game)).toBeNull();
    });
  });

  describe('getRoundResults', () => {
    it('should get all results for complete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, score: 90, id: 'c' },
          { name: 'Team D', seed: 4, score: 88, id: 'd' },
        ],
      ];
      
      const results = getRoundResults(round);
      
      expect(results).toHaveLength(2);
      expect(results[0].winner.name).toBe('Team A');
      expect(results[1].winner.name).toBe('Team C');
    });

    it('should include bye results', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
      ];
      
      const results = getRoundResults(round);
      
      expect(results).toHaveLength(2);
      expect(results[1].isBye).toBe(true);
      expect(results[1].loser).toBeNull();
    });

    it('should only return completed matches', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [
          { name: 'Team C', seed: 3, id: 'c' },
          { name: 'Team D', seed: 4, id: 'd' },
        ], // Incomplete
      ];
      
      const results = getRoundResults(round);
      expect(results).toHaveLength(1);
    });

    it('should return empty array for incomplete round', () => {
      const round: Round = [
        [
          { name: 'Team A', seed: 1, id: 'a' },
          { name: 'Team B', seed: 2, id: 'b' },
        ],
      ];
      
      expect(getRoundResults(round)).toHaveLength(0);
    });
  });

  describe('buildTeamHistory', () => {
    const sampleTournament: TournamentData = [
      [
        [
          { name: 'Warriors', seed: 1, score: 105, id: 'warriors' },
          { name: 'Thunder', seed: 8, score: 92, id: 'thunder' },
        ],
        [
          { name: 'Lakers', seed: 2, score: 110, id: 'lakers' },
          { name: 'Rockets', seed: 7, score: 98, id: 'rockets' },
        ],
      ],
      [
        [
          { name: 'Warriors', seed: 1, score: 118, id: 'warriors' },
          { name: 'Lakers', seed: 2, score: 105, id: 'lakers' },
        ],
      ],
      [[{ name: 'Warriors', seed: 1, id: 'warriors' }]],
    ];

    it('should build complete history for winning team', () => {
      const history = buildTeamHistory('warriors', sampleTournament);
      
      expect(history).toBeTruthy();
      expect(history!.team.name).toBe('Warriors');
      expect(history!.wins).toBe(2);
      expect(history!.losses).toBe(0);
      expect(history!.matches).toHaveLength(2);
      expect(history!.finalPlacement).toBe(1); // Champion
    });

    it('should build history for losing team', () => {
      const history = buildTeamHistory('lakers', sampleTournament);
      
      expect(history).toBeTruthy();
      expect(history!.team.name).toBe('Lakers');
      expect(history!.wins).toBe(1);
      expect(history!.losses).toBe(1);
      expect(history!.matches).toHaveLength(2);
    });

    it('should track team through multiple rounds', () => {
      const history = buildTeamHistory('warriors', sampleTournament);
      
      expect(history!.matches).toHaveLength(2);
      
      // First match
      expect(history!.matches[0].won).toBe(true);
      expect(history!.matches[0].opponent!.name).toBe('Thunder');
      expect(history!.matches[0].score).toBe(105);
      expect(history!.matches[0].opponentScore).toBe(92);
      
      // Second match
      expect(history!.matches[1].won).toBe(true);
      expect(history!.matches[1].opponent!.name).toBe('Lakers');
      expect(history!.matches[1].score).toBe(118);
      expect(history!.matches[1].opponentScore).toBe(105);
    });

    it('should handle bye in history', () => {
      const tournamentWithBye: TournamentData = [
        [
          [{ name: 'Warriors', seed: 1, id: 'warriors' }], // Bye
          [
            { name: 'Lakers', seed: 2, score: 100, id: 'lakers' },
            { name: 'Celtics', seed: 3, score: 95, id: 'celtics' },
          ],
        ],
        [
          [
            { name: 'Warriors', seed: 1, score: 110, id: 'warriors' },
            { name: 'Lakers', seed: 2, score: 105, id: 'lakers' },
          ],
        ],
      ];
      
      const history = buildTeamHistory('warriors', tournamentWithBye);
      
      expect(history!.matches).toHaveLength(2);
      
      // First match was bye
      expect(history!.matches[0].isBye).toBe(true);
      expect(history!.matches[0].opponent).toBeNull();
      expect(history!.matches[0].won).toBe(true);
      
      // Second match was regular
      expect(history!.matches[1].isBye).toBe(false);
      expect(history!.matches[1].opponent!.name).toBe('Lakers');
    });

    it('should return null for non-existent team', () => {
      const history = buildTeamHistory('nonexistent', sampleTournament);
      expect(history).toBeNull();
    });

    it('should use custom round labels', () => {
      const roundLabels = ['Quarterfinals', 'Semifinals', 'Finals'];
      const history = buildTeamHistory('warriors', sampleTournament, roundLabels);
      
      expect(history!.matches[0].roundLabel).toBe('Quarterfinals');
      expect(history!.matches[1].roundLabel).toBe('Semifinals');
    });

    it('should determine runner-up placement', () => {
      const history = buildTeamHistory('lakers', sampleTournament);
      
      // Lakers lost in finals
      expect(history!.finalPlacement).toBe(2);
    });

    it('should handle team that lost in first round', () => {
      const history = buildTeamHistory('thunder', sampleTournament);
      
      expect(history).toBeTruthy();
      expect(history!.wins).toBe(0);
      expect(history!.losses).toBe(1);
      expect(history!.matches).toHaveLength(1);
      expect(history!.matches[0].won).toBe(false);
    });

    it('should count wins and losses correctly', () => {
      const complexTournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
        ],
        [
          [
            { name: 'Team A', seed: 1, score: 90, id: 'a' },
            { name: 'Team C', seed: 3, score: 95, id: 'c' },
          ],
        ],
      ];
      
      const historyA = buildTeamHistory('a', complexTournament);
      expect(historyA!.wins).toBe(1);
      expect(historyA!.losses).toBe(1);
    });
  });

  describe('calculateStatistics', () => {
    const completeTournament: TournamentData = [
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

    it('should calculate basic statistics', () => {
      const stats = calculateStatistics(completeTournament);
      
      expect(stats.participantCount).toBe(4);
      expect(stats.totalRounds).toBe(3);
      expect(stats.byeCount).toBe(1); // Champion round
    });

    it('should calculate completion percentage', () => {
      const stats = calculateStatistics(completeTournament);
      
      // 3 total matches, 2 completed (excluding champion)
      expect(stats.completionPercentage).toBeGreaterThan(50);
    });

    it('should calculate average score', () => {
      const stats = calculateStatistics(completeTournament);
      
      expect(stats.averageScore).toBeDefined();
      expect(stats.averageScore).toBeGreaterThan(80);
      expect(stats.averageScore).toBeLessThan(110);
    });

    it('should find highest score', () => {
      const stats = calculateStatistics(completeTournament);
      
      expect(stats.highestScore).toBeDefined();
      expect(stats.highestScore!.score).toBe(100);
      expect(stats.highestScore!.team.name).toBe('Team A');
      expect(stats.highestScore!.round).toBe(0);
    });

    it('should count byes correctly', () => {
      const tournamentWithByes: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
          [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
          [{ name: 'Team D', seed: 4, id: 'd' }], // Bye
        ],
      ];
      
      const stats = calculateStatistics(tournamentWithByes);
      expect(stats.byeCount).toBe(2);
    });

    it('should handle tournament with no scores', () => {
      const noScoresTournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, id: 'a' },
            { name: 'Team B', seed: 2, id: 'b' },
          ],
        ],
      ];
      
      const stats = calculateStatistics(noScoresTournament);
      
      expect(stats.averageScore).toBeUndefined();
      expect(stats.highestScore).toBeUndefined();
      expect(stats.completionPercentage).toBe(0);
    });

    it('should count unique participants', () => {
      const stats = calculateStatistics(completeTournament);
      
      // Team A appears 3 times, but should count as 1
      expect(stats.participantCount).toBe(4);
    });

    it('should handle teams without IDs', () => {
      const tournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100 },
            { name: 'Team B', seed: 2, score: 85 },
          ],
        ],
      ];
      
      const stats = calculateStatistics(tournament);
      
      // Can't count unique without IDs
      expect(stats.participantCount).toBe(0);
    });
  });

  describe('generateTournamentReport', () => {
    const sampleTournament: TournamentData = [
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

    it('should generate complete report', () => {
      const report = generateTournamentReport(sampleTournament);
      
      expect(report.totalRounds).toBe(3);
      expect(report.totalMatches).toBe(4);
      expect(report.completedMatches).toBeGreaterThan(0);
      expect(report.allResults).toHaveLength(3);
    });

    it('should identify champion', () => {
      const report = generateTournamentReport(sampleTournament);
      
      expect(report.champion).toBeDefined();
      expect(report.champion!.name).toBe('Team A');
    });

    it('should identify finalists', () => {
      const report = generateTournamentReport(sampleTournament);
      
      expect(report.finalists).toBeDefined();
      expect(report.finalists).toHaveLength(2);
      expect(report.finalists!.map(t => t.name).sort()).toEqual(['Team A', 'Team C']);
    });

    it('should include statistics when requested', () => {
      const report = generateTournamentReport(sampleTournament, [], true);
      
      expect(report.statistics).toBeDefined();
      expect(report.statistics!.participantCount).toBe(4);
    });

    it('should not include statistics by default', () => {
      const report = generateTournamentReport(sampleTournament, [], false);
      
      expect(report.statistics).toBeUndefined();
    });

    it('should use custom round labels', () => {
      const labels = ['Quarterfinals', 'Semifinals', 'Finals'];
      const report = generateTournamentReport(sampleTournament, labels);
      
      expect(report.allResults[0].roundLabel).toBe('Quarterfinals');
      expect(report.allResults[1].roundLabel).toBe('Semifinals');
      expect(report.allResults[2].roundLabel).toBe('Finals');
    });

    it('should handle incomplete tournament', () => {
      const incompleteTournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
          [
            { name: 'Team C', seed: 3, id: 'c' },
            { name: 'Team D', seed: 4, id: 'd' },
          ],
        ],
      ];
      
      const report = generateTournamentReport(incompleteTournament);
      
      expect(report.champion).toBeUndefined();
      expect(report.completedMatches).toBe(1);
      expect(report.remainingMatches).toBe(1);
    });

    it('should calculate remaining matches', () => {
      const report = generateTournamentReport(sampleTournament);
      
      expect(report.completedMatches + report.remainingMatches).toBe(report.totalMatches);
    });

    it('should track current round', () => {
      const partialTournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
        ],
        [
          [
            { name: 'Team A', seed: 1, id: 'a' },
            { name: 'Team C', seed: 3, id: 'c' },
          ],
        ],
      ];
      
      const report = generateTournamentReport(partialTournament);
      
      // Round 0 complete, round 1 incomplete
      expect(report.currentRound).toBe(1);
    });
  });

  describe('formatReportAsText', () => {
    const sampleReport = generateTournamentReport([
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
      ],
      [
        [
          { name: 'Team A', seed: 1, score: 95, id: 'a' },
          { name: 'Team C', seed: 3, score: 92, id: 'c' },
        ],
      ],
      [[{ name: 'Team A', seed: 1, id: 'a' }]],
    ], ['Round 1', 'Finals', 'Champion'], true);

    it('should format report as text', () => {
      const text = formatReportAsText(sampleReport, true);
      
      expect(text).toContain('TOURNAMENT REPORT');
      expect(text).toContain('Team A');
      expect(text).toContain('CHAMPION');
    });

    it('should include scores when requested', () => {
      const text = formatReportAsText(sampleReport, true);
      
      expect(text).toContain('(100)');
      expect(text).toContain('(85)');
    });

    it('should exclude scores when not requested', () => {
      const text = formatReportAsText(sampleReport, false);
      
      expect(text).not.toContain('(100)');
      expect(text).toContain('Team A');
      expect(text).toContain('defeated');
    });

    it('should show bye matches', () => {
      const text = formatReportAsText(sampleReport, true);
      
      expect(text).toContain('(BYE)');
    });

    it('should include statistics when present', () => {
      const text = formatReportAsText(sampleReport, true);
      
      expect(text).toContain('Statistics');
      expect(text).toContain('Participants');
      expect(text).toContain('Byes');
    });

    it('should show advancing teams', () => {
      const text = formatReportAsText(sampleReport, true);
      
      expect(text).toContain('Advancing');
    });
  });

  describe('formatReportAsMarkdown', () => {
    const sampleReport = generateTournamentReport([
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
      ],
      [[{ name: 'Team A', seed: 1, id: 'a' }]],
    ]);

    it('should format as markdown', () => {
      const md = formatReportAsMarkdown(sampleReport, true);
      
      expect(md).toContain('# Tournament Report');
      expect(md).toContain('##');
      expect(md).toContain('|'); // Tables
    });

    it('should include tables with scores', () => {
      const md = formatReportAsMarkdown(sampleReport, true);
      
      expect(md).toContain('| Match |');
      expect(md).toContain('| Winner |');
      expect(md).toContain('| Score |');
      expect(md).toContain('100');
    });

    it('should format without tables when scores excluded', () => {
      const md = formatReportAsMarkdown(sampleReport, false);
      
      expect(md).toContain('# Tournament Report');
      expect(md).toContain('- **Match');
      expect(md).not.toContain('| Score |');
    });

    it('should show champion with trophy emoji', () => {
      const md = formatReportAsMarkdown(sampleReport, true);
      
      expect(md).toContain('🏆 Champion');
      expect(md).toContain('Team A');
    });
  });

  describe('formatReportAsHTML', () => {
    const sampleReport = generateTournamentReport([
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
        [{ name: 'Team C', seed: 3, id: 'c' }], // Bye
      ],
      [[{ name: 'Team A', seed: 1, id: 'a' }]],
    ], [], true);

    it('should format as HTML', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('<div class="tournament-report">');
      expect(html).toContain('<h2>Tournament Report</h2>');
      expect(html).toContain('</div>');
    });

    it('should include HTML table', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('<table>');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('</table>');
    });

    it('should include statistics section', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('<div class="statistics">');
      expect(html).toContain('<h3>Statistics</h3>');
    });

    it('should show champion section', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('<div class="champion">');
      expect(html).toContain('🏆 Champion');
    });

    it('should include scores when requested', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('<th>Score</th>');
      expect(html).toContain('100');
    });

    it('should show bye matches', () => {
      const html = formatReportAsHTML(sampleReport, true);
      
      expect(html).toContain('BYE');
    });
  });

  describe('complex tournament scenarios', () => {
    it('should handle tournament with byes in multiple rounds', () => {
      const tournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
          [{ name: 'Team C', seed: 3, id: 'c' }], // Bye R1
        ],
        [
          [
            { name: 'Team A', seed: 1, score: 95, id: 'a' },
            { name: 'Team C', seed: 3, score: 90, id: 'c' },
          ],
          [{ name: 'Team D', seed: 4, id: 'd' }], // Bye R2
        ],
      ];
      
      const stats = calculateStatistics(tournament);
      expect(stats.byeCount).toBe(2);
      
      const report = generateTournamentReport(tournament);
      expect(report.allResults).toHaveLength(2);
    });

    it('should handle single-round tournament', () => {
      const tournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 85, id: 'b' },
          ],
        ],
        [[{ name: 'Team A', seed: 1, id: 'a' }]],
      ];
      
      const report = generateTournamentReport(tournament);
      
      expect(report.totalRounds).toBe(2);
      expect(report.champion!.name).toBe('Team A');
    });

    it('should handle large tournament', () => {
      // Create 16-team tournament
      const teams: Team[] = Array.from({ length: 16 }, (_, i) => ({
        name: `Team ${i + 1}`,
        seed: i + 1,
        id: `t${i + 1}`,
        score: Math.floor(Math.random() * 20) + 90,
      }));
      
      const rounds: Round[] = [
        Array.from({ length: 8 }, (_, i) => [teams[i * 2], teams[i * 2 + 1]]),
      ];
      
      const stats = calculateStatistics(rounds);
      
      expect(stats.participantCount).toBe(16);
      expect(stats.totalRounds).toBe(1);
      expect(stats.averageScore).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty tournament', () => {
      const stats = calculateStatistics([]);
      
      expect(stats.participantCount).toBe(0);
      expect(stats.totalRounds).toBe(0);
      expect(stats.byeCount).toBe(0);
      expect(stats.completionPercentage).toBe(0);
    });

    it('should handle tournament with only byes', () => {
      const tournament: TournamentData = [
        [
          [{ name: 'Team A', seed: 1, id: 'a' }],
          [{ name: 'Team B', seed: 2, id: 'b' }],
        ],
      ];
      
      const stats = calculateStatistics(tournament);
      expect(stats.byeCount).toBe(2);
      expect(stats.completionPercentage).toBe(100); // Byes are "complete"
    });

    it('should handle tournament with score of 0', () => {
      const tournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 100, id: 'a' },
            { name: 'Team B', seed: 2, score: 0, id: 'b' },
          ],
        ],
      ];
      
      const stats = calculateStatistics(tournament);
      
      expect(stats.averageScore).toBe(50); // (100 + 0) / 2
    });

    it('should handle very high scores', () => {
      const tournament: TournamentData = [
        [
          [
            { name: 'Team A', seed: 1, score: 999, id: 'a' },
            { name: 'Team B', seed: 2, score: 998, id: 'b' },
          ],
        ],
      ];
      
      const stats = calculateStatistics(tournament);
      
      expect(stats.highestScore!.score).toBe(999);
      expect(stats.averageScore).toBe(998.5);
    });
  });

  describe('report format consistency', () => {
    const tournament: TournamentData = [
      [
        [
          { name: 'Team A', seed: 1, score: 100, id: 'a' },
          { name: 'Team B', seed: 2, score: 85, id: 'b' },
        ],
      ],
      [[{ name: 'Team A', seed: 1, id: 'a' }]],
    ];

    it('should include champion in all formats', () => {
      const report = generateTournamentReport(tournament);
      
      const text = formatReportAsText(report);
      const markdown = formatReportAsMarkdown(report);
      const html = formatReportAsHTML(report);
      
      expect(text).toContain('CHAMPION');
      expect(markdown).toContain('Champion');
      expect(html).toContain('Champion');
    });

    it('should show match results in all formats', () => {
      const report = generateTournamentReport(tournament);
      
      const text = formatReportAsText(report, true);
      const markdown = formatReportAsMarkdown(report, true);
      const html = formatReportAsHTML(report, true);
      
      expect(text).toContain('Team A');
      expect(text).toContain('Team B');
      
      expect(markdown).toContain('Team A');
      expect(markdown).toContain('Team B');
      
      expect(html).toContain('Team A');
      expect(html).toContain('Team B');
    });
  });
});
