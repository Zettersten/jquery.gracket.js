/**
 * Tournament utility functions
 * Core logic for match winners, round completion, and advancement
 */

import type { Game, Round, Team } from '../types';

/**
 * Check if a game is a bye (single team)
 */
export const isByeGame = (game: Game): boolean => {
  return game.length === 1;
};

/**
 * Determine the winner of a match
 * Returns null if match is incomplete or tied (without tie-breaker)
 */
export const getMatchWinner = (game: Game): Team | null => {
  // Bye game - single team automatically advances
  if (isByeGame(game)) {
    return game[0];
  }

  // Need exactly 2 teams for a regular match
  if (game.length !== 2) {
    return null;
  }

  const [team1, team2] = game;

  // Both teams must have scores
  if (team1.score === undefined || team2.score === undefined) {
    return null;
  }

  // Determine winner by score
  if (team1.score > team2.score) {
    return team1;
  } else if (team2.score > team1.score) {
    return team2;
  }

  // Tied - needs tie-breaker
  return null;
};

/**
 * Check if a round is complete (all games have determined winners)
 */
export const isRoundComplete = (round: Round): boolean => {
  if (!round || round.length === 0) {
    return false;
  }

  return round.every(game => getMatchWinner(game) !== null);
};

/**
 * Apply tie-breaking strategy to determine winner
 */
export const applyTieBreaker = (
  team1: Team,
  team2: Team,
  strategy: 'higher-seed' | 'lower-seed' | 'callback',
  tieBreakerFn?: (t1: Team, t2: Team) => Team
): Team => {
  switch (strategy) {
    case 'higher-seed':
      // Lower seed number = higher seed
      return team1.seed < team2.seed ? team1 : team2;
    
    case 'lower-seed':
      // Higher seed number = lower seed
      return team1.seed > team2.seed ? team1 : team2;
    
    case 'callback':
      if (!tieBreakerFn) {
        throw new Error('Tie-breaker callback function is required when strategy is "callback"');
      }
      return tieBreakerFn(team1, team2);
    
    default:
      throw new Error(`Unknown tie-breaker strategy: ${strategy}`);
  }
};

/**
 * Validate that all games in a round have winners
 * Throws descriptive error if any game is incomplete
 */
export const validateRoundComplete = (round: Round, roundIndex: number): void => {
  round.forEach((game, gameIndex) => {
    const winner = getMatchWinner(game);
    
    if (!winner) {
      if (isByeGame(game)) {
        throw new Error(`Round ${roundIndex + 1}, Game ${gameIndex + 1}: Bye game has no team`);
      }
      
      if (game.length !== 2) {
        throw new Error(`Round ${roundIndex + 1}, Game ${gameIndex + 1}: Invalid game structure (${game.length} teams)`);
      }
      
      const [team1, team2] = game;
      
      if (team1.score === undefined || team2.score === undefined) {
        throw new Error(`Round ${roundIndex + 1}, Game ${gameIndex + 1}: Missing scores (${team1.name} vs ${team2.name})`);
      }
      
      if (team1.score === team2.score) {
        throw new Error(`Round ${roundIndex + 1}, Game ${gameIndex + 1}: Tied score (${team1.name} ${team1.score} - ${team2.name} ${team2.score}). Use tie-breaker option.`);
      }
    }
  });
};

/**
 * Collect all winners from a round
 * Applies tie-breaking if needed
 */
export const collectWinners = (
  round: Round,
  tieBreaker: 'error' | 'higher-seed' | 'lower-seed' | 'callback' = 'error',
  tieBreakerFn?: (t1: Team, t2: Team) => Team
): Team[] => {
  return round.map(game => {
    const winner = getMatchWinner(game);
    
    if (winner) {
      return winner;
    }
    
    // Handle ties
    if (game.length === 2) {
      const [team1, team2] = game;
      
      if (team1.score !== undefined && team2.score !== undefined && team1.score === team2.score) {
        if (tieBreaker === 'error') {
          throw new Error(`Tied score between ${team1.name} and ${team2.name}. Specify tie-breaker option.`);
        }
        return applyTieBreaker(team1, team2, tieBreaker, tieBreakerFn);
      }
    }
    
    throw new Error('Unable to determine winner for game');
  });
};

/**
 * Generate the next round from winners
 */
export const generateNextRound = (winners: Team[], preserveScores: boolean = false): Round => {
  if (winners.length === 0) {
    return [];
  }
  
  // If only 1 winner, this is the champion round
  if (winners.length === 1) {
    return [[{ ...winners[0], score: preserveScores ? winners[0].score : undefined }]];
  }
  
  // Pair up winners for next round
  const nextRound: Round = [];
  
  for (let i = 0; i < winners.length; i += 2) {
    if (i + 1 < winners.length) {
      // Regular matchup
      nextRound.push([
        { ...winners[i], score: preserveScores ? winners[i].score : undefined },
        { ...winners[i + 1], score: preserveScores ? winners[i + 1].score : undefined }
      ]);
    } else {
      // Odd number of winners - last team gets bye
      nextRound.push([
        { ...winners[i], score: preserveScores ? winners[i].score : undefined }
      ]);
    }
  }
  
  return nextRound;
};

/**
 * Count total number of matches in tournament
 */
export const countTotalMatches = (rounds: Round[]): number => {
  return rounds.reduce((total, round) => total + round.length, 0);
};

/**
 * Count completed matches in tournament
 */
export const countCompletedMatches = (rounds: Round[]): number => {
  let count = 0;
  
  for (const round of rounds) {
    for (const game of round) {
      if (getMatchWinner(game) !== null) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * Count number of byes in tournament
 */
export const countByes = (rounds: Round[]): number => {
  let count = 0;
  
  for (const round of rounds) {
    for (const game of round) {
      if (isByeGame(game)) {
        count++;
      }
    }
  }
  
  return count;
};
