/**
 * Reporting and statistics utilities
 * Implements Issue #14b
 */

import type {
  TournamentData,
  Round,
  Game,
  Team,
  MatchResult,
  TeamHistory,
  MatchEntry,
  TournamentReport,
  RoundReport,
  TournamentStatistics,
} from '../types';
import { isByeGame, getMatchWinner, countTotalMatches, countCompletedMatches, countByes } from './tournament';

/**
 * Get advancing teams from a round
 */
export const getAdvancingTeams = (round: Round): Team[] => {
  const winners: Team[] = [];
  
  for (const game of round) {
    const winner = getMatchWinner(game);
    if (winner) {
      winners.push(winner);
    }
  }
  
  return winners;
};

/**
 * Get match result for a single game
 */
export const getGameResult = (game: Game): MatchResult | null => {
  // Bye game
  if (isByeGame(game)) {
    return {
      winner: game[0],
      loser: null,
      winnerScore: game[0].score,
      loserScore: undefined,
      isBye: true,
    };
  }
  
  // Regular game
  if (game.length !== 2) {
    return null;
  }
  
  const [team1, team2] = game;
  const winner = getMatchWinner(game);
  
  if (!winner) {
    return null; // Match not complete
  }
  
  const loser = winner === team1 ? team2 : team1;
  
  return {
    winner,
    loser,
    winnerScore: winner.score,
    loserScore: loser.score,
    isBye: false,
  };
};

/**
 * Get all match results for a round
 */
export const getRoundResults = (round: Round): MatchResult[] => {
  const results: MatchResult[] = [];
  
  for (const game of round) {
    const result = getGameResult(game);
    if (result) {
      results.push(result);
    }
  }
  
  return results;
};

/**
 * Build team history by tracking a team through all rounds
 */
export const buildTeamHistory = (
  teamId: string,
  tournamentData: TournamentData,
  roundLabels: string[] = []
): TeamHistory | null => {
  let team: Team | null = null;
  const matches: MatchEntry[] = [];
  let wins = 0;
  let losses = 0;
  
  // Find team and track through rounds
  for (let roundIndex = 0; roundIndex < tournamentData.length; roundIndex++) {
    const round = tournamentData[roundIndex];
    const roundLabel = roundLabels[roundIndex] || `Round ${roundIndex + 1}`;
    const isLastRound = roundIndex === tournamentData.length - 1;
    
    // Find game with this team
    for (const game of round) {
      const teamInGame = game.find(t => t.id === teamId);
      
      if (teamInGame) {
        // Store team reference (use latest)
        team = teamInGame;
        
        // Skip champion display (last round, single team)
        if (isLastRound && round.length === 1 && game.length === 1) {
          break; // Don't count champion display as a match
        }
        
        // Determine match outcome
        if (isByeGame(game)) {
          // Bye - automatic win
          matches.push({
            roundIndex,
            roundLabel,
            opponent: null,
            won: true,
            score: teamInGame.score,
            opponentScore: undefined,
            isBye: true,
          });
          wins++;
        } else if (game.length === 2) {
          const opponent = game.find(t => t.id !== teamId);
          const winner = getMatchWinner(game);
          
          if (winner) {
            const won = winner.id === teamId;
            matches.push({
              roundIndex,
              roundLabel,
              opponent: opponent || null,
              won,
              score: teamInGame.score,
              opponentScore: opponent?.score,
              isBye: false,
            });
            
            if (won) {
              wins++;
            } else {
              losses++;
            }
          }
        }
        
        break; // Found team in this round
      }
    }
  }
  
  if (!team) {
    return null; // Team not found
  }
  
  // Determine final placement
  let finalPlacement: number | undefined;
  
  // Check if team is in final round (champion)
  const lastRound = tournamentData[tournamentData.length - 1];
  if (lastRound && lastRound.length === 1 && lastRound[0].length === 1) {
    if (lastRound[0][0].id === teamId) {
      finalPlacement = 1; // Champion
    }
  }
  
  // Check if team is in finals (runner-up)
  if (!finalPlacement && tournamentData.length >= 2) {
    const finalsRound = tournamentData[tournamentData.length - 2];
    if (finalsRound && finalsRound.length === 1 && finalsRound[0].length === 2) {
      const inFinals = finalsRound[0].some(t => t.id === teamId);
      const finalsWinner = getMatchWinner(finalsRound[0]);
      if (inFinals && finalsWinner && finalsWinner.id !== teamId) {
        finalPlacement = 2; // Runner-up
      }
    }
  }
  
  return {
    team,
    matches,
    finalPlacement,
    wins,
    losses,
  };
};

/**
 * Generate round report
 */
export const generateRoundReport = (
  round: Round,
  roundIndex: number,
  roundLabel: string
): RoundReport => {
  const matches = getRoundResults(round);
  const advancingTeams = getAdvancingTeams(round);
  const isComplete = matches.length === round.length;
  
  return {
    roundIndex,
    roundLabel,
    isComplete,
    matches,
    advancingTeams,
  };
};

/**
 * Calculate tournament statistics
 */
export const calculateStatistics = (tournamentData: TournamentData): TournamentStatistics => {
  const totalMatches = countTotalMatches(tournamentData);
  const completedMatches = countCompletedMatches(tournamentData);
  const byeCount = countByes(tournamentData);
  
  // Count unique participants (only from first round to avoid counting placeholders)
  const uniqueTeams = new Set<string>();
  if (tournamentData.length > 0) {
    const firstRound = tournamentData[0];
    for (const game of firstRound) {
      for (const team of game) {
        if (team.id && team.name && !team.name.includes('TBD')) {
          uniqueTeams.add(team.id);
        }
      }
    }
  }
  
  // Calculate average score
  let totalScore = 0;
  let scoreCount = 0;
  let highestScore: { team: Team; score: number; round: number } | undefined;
  
  for (let roundIndex = 0; roundIndex < tournamentData.length; roundIndex++) {
    const round = tournamentData[roundIndex];
    for (const game of round) {
      for (const team of game) {
        if (team.score !== undefined) {
          totalScore += team.score;
          scoreCount++;
          
          if (!highestScore || team.score > highestScore.score) {
            highestScore = {
              team,
              score: team.score,
              round: roundIndex,
            };
          }
        }
      }
    }
  }
  
  const averageScore = scoreCount > 0 ? totalScore / scoreCount : undefined;
  const completionPercentage = totalMatches > 0 
    ? Math.round((completedMatches / totalMatches) * 100) 
    : 0;
  
  return {
    participantCount: uniqueTeams.size,
    totalRounds: tournamentData.length,
    byeCount,
    averageScore,
    highestScore,
    completionPercentage,
  };
};

/**
 * Generate complete tournament report
 */
export const generateTournamentReport = (
  tournamentData: TournamentData,
  roundLabels: string[] = [],
  includeStatistics: boolean = false
): TournamentReport => {
  const totalMatches = countTotalMatches(tournamentData);
  const completedMatches = countCompletedMatches(tournamentData);
  const remainingMatches = totalMatches - completedMatches;
  
  // Generate round reports
  const allResults: RoundReport[] = [];
  let currentRound = 0;
  
  for (let i = 0; i < tournamentData.length; i++) {
    const round = tournamentData[i];
    const roundLabel = roundLabels[i] || `Round ${i + 1}`;
    const roundReport = generateRoundReport(round, i, roundLabel);
    
    allResults.push(roundReport);
    
    if (!roundReport.isComplete && i < currentRound) {
      currentRound = i;
    } else if (roundReport.isComplete) {
      currentRound = i + 1;
    }
  }
  
  // Determine champion and finalists
  let champion: Team | undefined;
  let finalists: Team[] | undefined;
  
  if (tournamentData.length > 0) {
    const lastRound = tournamentData[tournamentData.length - 1];
    if (lastRound.length === 1 && lastRound[0].length === 1) {
      champion = lastRound[0][0];
    }
    
    if (tournamentData.length >= 2) {
      const finalsRound = tournamentData[tournamentData.length - 2];
      if (finalsRound.length === 1 && finalsRound[0].length === 2) {
        finalists = [...finalsRound[0]];
      }
    }
  }
  
  const report: TournamentReport = {
    totalRounds: tournamentData.length,
    totalMatches,
    completedMatches,
    remainingMatches,
    currentRound,
    champion,
    finalists,
    allResults,
  };
  
  if (includeStatistics) {
    report.statistics = calculateStatistics(tournamentData);
  }
  
  return report;
};

/**
 * Format report as plain text
 */
export const formatReportAsText = (
  report: TournamentReport,
  includeScores: boolean = true
): string => {
  const lines: string[] = [];
  
  lines.push('='.repeat(50));
  lines.push('TOURNAMENT REPORT');
  lines.push('='.repeat(50));
  lines.push('');
  
  if (report.statistics) {
    lines.push('Tournament Statistics:');
    lines.push(`- Total Participants: ${report.statistics.participantCount}`);
    lines.push(`- Total Rounds: ${report.statistics.totalRounds}`);
    lines.push(`- Total Matches: ${report.totalMatches}`);
    lines.push(`- Completed: ${report.completedMatches}/${report.totalMatches} (${report.statistics.completionPercentage}%)`);
    if (report.statistics.byeCount > 0) {
      lines.push(`- Byes: ${report.statistics.byeCount}`);
    }
    if (report.statistics.averageScore !== undefined) {
      lines.push(`- Average Score: ${report.statistics.averageScore.toFixed(1)}`);
    }
    lines.push('');
  }
  
  // Round by round
  for (const roundReport of report.allResults) {
    lines.push(`${roundReport.roundLabel.toUpperCase()}`);
    
    if (roundReport.matches.length === 0) {
      lines.push('  (No completed matches)');
    } else {
      roundReport.matches.forEach((match, idx) => {
        if (match.isBye) {
          lines.push(`  ✓ Match ${idx + 1}: ${match.winner.name} (BYE)`);
        } else {
          const winnerScore = includeScores && match.winnerScore !== undefined ? ` (${match.winnerScore})` : '';
          const loserScore = includeScores && match.loserScore !== undefined ? ` (${match.loserScore})` : '';
          lines.push(`  ✓ Match ${idx + 1}: ${match.winner.name}${winnerScore} defeated ${match.loser?.name}${loserScore}`);
        }
      });
    }
    
    if (roundReport.advancingTeams.length > 0 && roundReport.roundIndex < report.totalRounds - 1) {
      lines.push('');
      lines.push(`  Advancing: ${roundReport.advancingTeams.map(t => t.name).join(', ')}`);
    }
    
    lines.push('');
  }
  
  if (report.champion) {
    lines.push(`CHAMPION: ${report.champion.name} (Seed ${report.champion.seed})`);
    lines.push('='.repeat(50));
  }
  
  return lines.join('\n');
};

/**
 * Format report as markdown
 */
export const formatReportAsMarkdown = (
  report: TournamentReport,
  includeScores: boolean = true
): string => {
  const lines: string[] = [];
  
  lines.push('# Tournament Report');
  lines.push('');
  
  if (report.statistics) {
    lines.push('## Statistics');
    lines.push('');
    lines.push(`- **Participants**: ${report.statistics.participantCount}`);
    lines.push(`- **Total Rounds**: ${report.statistics.totalRounds}`);
    lines.push(`- **Completion**: ${report.completedMatches}/${report.totalMatches} (${report.statistics.completionPercentage}%)`);
    if (report.statistics.byeCount > 0) {
      lines.push(`- **Byes**: ${report.statistics.byeCount}`);
    }
    if (report.statistics.averageScore !== undefined) {
      lines.push(`- **Average Score**: ${report.statistics.averageScore.toFixed(1)}`);
    }
    lines.push('');
  }
  
  // Round by round
  for (const roundReport of report.allResults) {
    lines.push(`## ${roundReport.roundLabel}`);
    lines.push('');
    
    if (roundReport.matches.length === 0) {
      lines.push('_(No completed matches)_');
      lines.push('');
    } else {
      if (includeScores) {
        lines.push('| Match | Winner | Score | Loser | Score |');
        lines.push('|-------|--------|-------|-------|-------|');
        
        roundReport.matches.forEach((match, idx) => {
          if (match.isBye) {
            lines.push(`| ${idx + 1} | ${match.winner.name} | - | BYE | - |`);
          } else {
            const winnerScore = match.winnerScore !== undefined ? match.winnerScore : '-';
            const loserScore = match.loserScore !== undefined ? match.loserScore : '-';
            lines.push(`| ${idx + 1} | ${match.winner.name} | ${winnerScore} | ${match.loser?.name || '-'} | ${loserScore} |`);
          }
        });
      } else {
        roundReport.matches.forEach((match, idx) => {
          if (match.isBye) {
            lines.push(`- **Match ${idx + 1}**: ${match.winner.name} (BYE)`);
          } else {
            lines.push(`- **Match ${idx + 1}**: ${match.winner.name} defeated ${match.loser?.name}`);
          }
        });
      }
      
      lines.push('');
      
      if (roundReport.advancingTeams.length > 0 && roundReport.roundIndex < report.totalRounds - 1) {
        lines.push(`**Advancing**: ${roundReport.advancingTeams.map(t => t.name).join(', ')}`);
        lines.push('');
      }
    }
  }
  
  if (report.champion) {
    lines.push(`## 🏆 Champion: ${report.champion.name}`);
    lines.push('');
  }
  
  return lines.join('\n');
};

/**
 * Format report as HTML
 */
export const formatReportAsHTML = (
  report: TournamentReport,
  includeScores: boolean = true
): string => {
  const lines: string[] = [];
  
  lines.push('<div class="tournament-report">');
  lines.push('  <h2>Tournament Report</h2>');
  
  if (report.statistics) {
    lines.push('  <div class="statistics">');
    lines.push('    <h3>Statistics</h3>');
    lines.push('    <ul>');
    lines.push(`      <li>Participants: ${report.statistics.participantCount}</li>`);
    lines.push(`      <li>Total Rounds: ${report.statistics.totalRounds}</li>`);
    lines.push(`      <li>Completion: ${report.completedMatches}/${report.totalMatches} (${report.statistics.completionPercentage}%)</li>`);
    if (report.statistics.byeCount > 0) {
      lines.push(`      <li>Byes: ${report.statistics.byeCount}</li>`);
    }
    if (report.statistics.averageScore !== undefined) {
      lines.push(`      <li>Average Score: ${report.statistics.averageScore.toFixed(1)}</li>`);
    }
    lines.push('    </ul>');
    lines.push('  </div>');
  }
  
  // Round by round
  for (const roundReport of report.allResults) {
    lines.push('  <div class="round-report">');
    lines.push(`    <h3>${roundReport.roundLabel}</h3>`);
    
    if (roundReport.matches.length === 0) {
      lines.push('    <p><em>No completed matches</em></p>');
    } else {
      lines.push('    <table>');
      lines.push('      <thead>');
      lines.push('        <tr>');
      lines.push('          <th>Match</th>');
      lines.push('          <th>Winner</th>');
      if (includeScores) {
        lines.push('          <th>Score</th>');
      }
      lines.push('          <th>Loser</th>');
      if (includeScores) {
        lines.push('          <th>Score</th>');
      }
      lines.push('        </tr>');
      lines.push('      </thead>');
      lines.push('      <tbody>');
      
      roundReport.matches.forEach((match, idx) => {
        lines.push('        <tr>');
        lines.push(`          <td>${idx + 1}</td>`);
        lines.push(`          <td>${match.winner.name}</td>`);
        if (includeScores) {
          lines.push(`          <td>${match.winnerScore !== undefined ? match.winnerScore : '-'}</td>`);
        }
        lines.push(`          <td>${match.isBye ? 'BYE' : (match.loser?.name || '-')}</td>`);
        if (includeScores) {
          lines.push(`          <td>${match.loserScore !== undefined ? match.loserScore : '-'}</td>`);
        }
        lines.push('        </tr>');
      });
      
      lines.push('      </tbody>');
      lines.push('    </table>');
      
      if (roundReport.advancingTeams.length > 0 && roundReport.roundIndex < report.totalRounds - 1) {
        lines.push(`    <p><strong>Advancing:</strong> ${roundReport.advancingTeams.map(t => t.name).join(', ')}</p>`);
      }
    }
    
    lines.push('  </div>');
  }
  
  if (report.champion) {
    lines.push('  <div class="champion">');
    lines.push(`    <h3>🏆 Champion: ${report.champion.name}</h3>`);
    lines.push('  </div>');
  }
  
  lines.push('</div>');
  
  return lines.join('\n');
};
