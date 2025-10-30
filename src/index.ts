/**
 * Gracket - Modern tournament bracket library
 * @packageDocumentation
 */

import './style.css';

export { Gracket } from './core/Gracket';
export type {
  Team,
  Game,
  Round,
  TournamentData,
  GracketOptions,
  GracketSettings,
  LabelOffset,
  // New types for Issues #14 & #15
  AdvanceOptions,
  AutoGenerateOptions,
  MatchResult,
  MatchEntry,
  TeamHistory,
  RoundReport,
  TournamentReport,
  TournamentStatistics,
  ReportOptions,
  ByeSeedingStrategy,
} from './types';

// Export utility functions (Issue #15)
export { generateTournamentWithByes, calculateByesNeeded } from './utils/byes';
