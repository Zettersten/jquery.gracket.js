/**
 * Bye generation utilities for non-power-of-2 tournaments
 * Implements Issue #15
 */

import type { Team, TournamentData, Round, ByeSeedingStrategy } from '../types';

/**
 * Calculate the next power of 2 greater than or equal to n
 */
const nextPowerOf2 = (n: number): number => {
  return Math.pow(2, Math.ceil(Math.log2(n)));
};

/**
 * Calculate how many byes are needed for a tournament
 */
export const calculateByesNeeded = (teamCount: number): number => {
  if (teamCount < 2) {
    throw new Error('Tournament must have at least 2 teams');
  }
  
  const nextPower = nextPowerOf2(teamCount);
  return nextPower - teamCount;
};

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Generate tournament structure with byes for non-power-of-2 team counts
 * 
 * @param teams - Array of teams (can be any count >= 2)
 * @param strategy - How to assign byes:
 *   - 'top-seeds': Top-seeded teams get byes (default)
 *   - 'random': Random teams get byes
 *   - 'custom': Use team.isBye property (not implemented in Team type, use manual structure instead)
 * @returns Tournament data with proper bye structure
 * 
 * @example
 * // 6 teams - top 2 seeds get byes
 * const teams = [
 *   { name: 'Team 1', seed: 1 },
 *   { name: 'Team 2', seed: 2 },
 *   { name: 'Team 3', seed: 3 },
 *   { name: 'Team 4', seed: 4 },
 *   { name: 'Team 5', seed: 5 },
 *   { name: 'Team 6', seed: 6 },
 * ];
 * const data = generateTournamentWithByes(teams, 'top-seeds');
 */
export const generateTournamentWithByes = (
  teams: Team[],
  strategy: ByeSeedingStrategy = 'top-seeds'
): TournamentData => {
  if (teams.length < 2) {
    throw new Error('Tournament must have at least 2 teams');
  }
  
  const teamCount = teams.length;
  const byesNeeded = calculateByesNeeded(teamCount);
  
  // If already a power of 2, no byes needed
  if (byesNeeded === 0) {
    return generateRegularTournament(teams);
  }
  
  // Determine which teams get byes
  let byeTeams: Team[];
  let playingTeams: Team[];
  
  switch (strategy) {
    case 'top-seeds': {
      // Sort by seed (lower seed number = better)
      const sortedTeams = [...teams].sort((a, b) => a.seed - b.seed);
      byeTeams = sortedTeams.slice(0, byesNeeded);
      playingTeams = sortedTeams.slice(byesNeeded);
      break;
    }
    
    case 'random': {
      const shuffled = shuffleArray(teams);
      byeTeams = shuffled.slice(0, byesNeeded);
      playingTeams = shuffled.slice(byesNeeded);
      break;
    }
    
    case 'custom': {
      // For custom strategy, user should manually create tournament structure
      // This is here for API completeness
      throw new Error('Custom bye strategy not implemented. Please manually create tournament structure with single-team games for byes.');
    }
    
    default:
      throw new Error(`Unknown bye seeding strategy: ${strategy}`);
  }
  
  // Build first round
  const firstRound: Round = [];
  
  // Add regular matchups
  for (let i = 0; i < playingTeams.length; i += 2) {
    if (i + 1 < playingTeams.length) {
      firstRound.push([playingTeams[i], playingTeams[i + 1]]);
    } else {
      // Odd number of playing teams - last one gets bye
      firstRound.push([playingTeams[i]]);
    }
  }
  
  // Add bye games
  byeTeams.forEach(team => {
    firstRound.push([team]);
  });
  
  // Generate placeholder rounds for rest of tournament
  const tournamentData: TournamentData = [firstRound];
  
  // Calculate remaining rounds
  let currentWinners = firstRound.length; // All teams from first round advance
  
  while (currentWinners > 1) {
    const nextRound: Round = [];
    const gamesInRound = Math.floor(currentWinners / 2);
    
    for (let i = 0; i < gamesInRound; i++) {
      // Placeholder teams for next round
      nextRound.push([
        { name: `Winner ${i * 2 + 1}`, seed: i * 2 + 1, id: `winner-r${tournamentData.length}-g${i * 2}` },
        { name: `Winner ${i * 2 + 2}`, seed: i * 2 + 2, id: `winner-r${tournamentData.length}-g${i * 2 + 1}` }
      ]);
    }
    
    // Handle odd number of winners
    if (currentWinners % 2 === 1) {
      nextRound.push([
        { name: `Winner ${currentWinners}`, seed: currentWinners, id: `winner-r${tournamentData.length}-g${currentWinners - 1}` }
      ]);
    }
    
    tournamentData.push(nextRound);
    currentWinners = nextRound.length;
  }
  
  // Final round (champion)
  if (currentWinners === 1) {
    tournamentData.push([[
      { name: 'Champion', seed: 1, id: 'champion' }
    ]]);
  }
  
  return tournamentData;
};

/**
 * Generate regular tournament structure (power of 2 teams)
 */
const generateRegularTournament = (teams: Team[]): TournamentData => {
  if ((teams.length & (teams.length - 1)) !== 0) {
    throw new Error('Team count must be a power of 2 for regular tournament');
  }
  
  const tournamentData: TournamentData = [];
  
  // First round
  const firstRound: Round = [];
  for (let i = 0; i < teams.length; i += 2) {
    firstRound.push([teams[i], teams[i + 1]]);
  }
  tournamentData.push(firstRound);
  
  // Generate placeholder rounds
  let currentWinners = firstRound.length;
  
  while (currentWinners > 1) {
    const nextRound: Round = [];
    const gamesInRound = Math.floor(currentWinners / 2);
    
    for (let i = 0; i < gamesInRound; i++) {
      nextRound.push([
        { name: `Winner ${i * 2 + 1}`, seed: i * 2 + 1, id: `winner-r${tournamentData.length}-g${i * 2}` },
        { name: `Winner ${i * 2 + 2}`, seed: i * 2 + 2, id: `winner-r${tournamentData.length}-g${i * 2 + 1}` }
      ]);
    }
    
    tournamentData.push(nextRound);
    currentWinners = nextRound.length;
  }
  
  // Champion round
  tournamentData.push([[
    { name: 'Champion', seed: 1, id: 'champion' }
  ]]);
  
  return tournamentData;
};

/**
 * Check if a tournament has any byes
 */
export const tournamentHasByes = (tournamentData: TournamentData): boolean => {
  return tournamentData.some(round => 
    round.some(game => game.length === 1)
  );
};

/**
 * Get list of teams that received byes in a specific round
 */
export const getByeTeams = (round: Round): Team[] => {
  return round
    .filter(game => game.length === 1)
    .map(game => game[0]);
};
