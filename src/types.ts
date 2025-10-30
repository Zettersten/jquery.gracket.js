/**
 * Represents a team/player in the tournament
 */
export interface Team {
  /** Team/player name */
  name: string;
  /** Unique identifier for the team */
  id?: string;
  /** Seed position in the tournament */
  seed: number;
  /** Alternative display for seed (e.g., "D1" instead of "1") */
  displaySeed?: string | number;
  /** Score for this match */
  score?: number;
}

/**
 * Represents a game (match between teams)
 */
export type Game = Team[];

/**
 * Represents a round (collection of games)
 */
export type Round = Game[];

/**
 * Tournament data structure (collection of rounds)
 */
export type TournamentData = Round[];

/**
 * Configuration options for Gracket
 */
export interface GracketOptions {
  /** CSS class for the main bracket container */
  gracketClass?: string;
  /** CSS class for each game container */
  gameClass?: string;
  /** CSS class for each round container */
  roundClass?: string;
  /** CSS class for round labels */
  roundLabelClass?: string;
  /** CSS class for each team container */
  teamClass?: string;
  /** CSS class for the winner container */
  winnerClass?: string;
  /** CSS class for spacer elements */
  spacerClass?: string;
  /** CSS class for currently hovered/selected items */
  currentClass?: string;
  /** CSS class for seed display */
  seedClass?: string;
  /** Corner radius for bracket lines (px) */
  cornerRadius?: number;
  /** Canvas element ID (will be made unique automatically) */
  canvasId?: string;
  /** CSS class for the canvas element */
  canvasClass?: string;
  /** Color of the bracket lines */
  canvasLineColor?: string;
  /** Line cap style ('round' | 'square' | 'butt') */
  canvasLineCap?: CanvasLineCap;
  /** Width of the bracket lines (px) */
  canvasLineWidth?: number;
  /** Gap between elements and lines (px) */
  canvasLineGap?: number;
  /** Custom labels for each round */
  roundLabels?: string[];
  /** Tournament data source */
  src?: TournamentData;
  
  // Byes support (Issue #15)
  /** Label to display for bye placeholders */
  byeLabel?: string;
  /** CSS class for bye placeholder elements */
  byeClass?: string;
  /** Whether to show bye games in the bracket */
  showByeGames?: boolean;
  
  // Event callbacks (Issue #14)
  /** Callback fired when a score is updated */
  onScoreUpdate?: (roundIndex: number, gameIndex: number, teamIndex: number, score: number) => void;
  /** Callback fired when a round is completed */
  onRoundComplete?: (roundIndex: number) => void;
  /** Callback fired when a new round is generated */
  onRoundGenerated?: (roundIndex: number, roundData: Round) => void;
}

/**
 * Internal settings (merged defaults + options)
 */
export interface GracketSettings extends Omit<Required<GracketOptions>, 'onScoreUpdate' | 'onRoundComplete' | 'onRoundGenerated'> {
  canvasId: string;
  onScoreUpdate?: (roundIndex: number, gameIndex: number, teamIndex: number, score: number) => void;
  onRoundComplete?: (roundIndex: number) => void;
  onRoundGenerated?: (roundIndex: number, roundData: Round) => void;
}

/**
 * Offset information for label positioning
 */
export interface LabelOffset {
  padding: number;
  left: number;
  right: number;
  labels: string[];
  class: string;
  width: number;
}

/**
 * Options for advancing to the next round (Issue #14a)
 */
export interface AdvanceOptions {
  /** Strategy for handling tied scores */
  tieBreaker?: 'error' | 'higher-seed' | 'lower-seed' | 'callback';
  /** Custom tie-breaking function */
  tieBreakerFn?: (team1: Team, team2: Team) => Team;
  /** Preserve scores when advancing to next round */
  preserveScores?: boolean;
  /** Auto-create next round if it doesn't exist */
  createRounds?: boolean;
}

/**
 * Options for auto-generating tournament from results (Issue #14a)
 */
export interface AutoGenerateOptions extends AdvanceOptions {
  /** Callback fired when each round is generated */
  onRoundGenerated?: (roundIndex: number, roundData: Round) => void;
  /** Stop generation at specific round index */
  stopAtRound?: number;
}

/**
 * Result of a single match (Issue #14b)
 */
export interface MatchResult {
  /** Winning team */
  winner: Team;
  /** Losing team (null for bye) */
  loser: Team | null;
  /** Winner's score */
  winnerScore?: number;
  /** Loser's score */
  loserScore?: number;
  /** Whether this was a bye match */
  isBye: boolean;
}

/**
 * Single match entry in team history (Issue #14b)
 */
export interface MatchEntry {
  /** Round index (0-based) */
  roundIndex: number;
  /** Round label */
  roundLabel: string;
  /** Opponent team (null for bye) */
  opponent: Team | null;
  /** Whether this team won */
  won: boolean;
  /** This team's score */
  score?: number;
  /** Opponent's score */
  opponentScore?: number;
  /** Whether this was a bye */
  isBye: boolean;
}

/**
 * Complete history of a team through the tournament (Issue #14b)
 */
export interface TeamHistory {
  /** The team */
  team: Team;
  /** All matches played */
  matches: MatchEntry[];
  /** Final placement (1st, 2nd, 3rd, etc.) */
  finalPlacement?: number;
  /** Total wins */
  wins: number;
  /** Total losses */
  losses: number;
}

/**
 * Results for a single round (Issue #14b)
 */
export interface RoundReport {
  /** Round index (0-based) */
  roundIndex: number;
  /** Round label */
  roundLabel: string;
  /** Whether all matches in round are complete */
  isComplete: boolean;
  /** All match results in round */
  matches: MatchResult[];
  /** Teams advancing from this round */
  advancingTeams: Team[];
}

/**
 * Complete tournament report (Issue #14b)
 */
export interface TournamentReport {
  /** Total number of rounds */
  totalRounds: number;
  /** Total number of matches */
  totalMatches: number;
  /** Number of completed matches */
  completedMatches: number;
  /** Number of remaining matches */
  remainingMatches: number;
  /** Current round index */
  currentRound: number;
  /** Tournament champion (if determined) */
  champion?: Team;
  /** Finalists */
  finalists?: Team[];
  /** Detailed results for all rounds */
  allResults: RoundReport[];
  /** Tournament statistics (if requested) */
  statistics?: TournamentStatistics;
}

/**
 * Tournament statistics (Issue #14b)
 */
export interface TournamentStatistics {
  /** Total number of participants */
  participantCount: number;
  /** Total number of rounds */
  totalRounds: number;
  /** Number of byes in tournament */
  byeCount: number;
  /** Average score across all completed matches */
  averageScore?: number;
  /** Highest score in tournament */
  highestScore?: {
    team: Team;
    score: number;
    round: number;
  };
  /** Tournament completion percentage */
  completionPercentage: number;
}

/**
 * Options for generating reports (Issue #14b)
 */
export interface ReportOptions {
  /** Output format */
  format?: 'json' | 'text' | 'html' | 'markdown';
  /** Include scores in report */
  includeScores?: boolean;
  /** Include statistics in report */
  includeStatistics?: boolean;
  /** Custom round labels for report */
  roundLabels?: string[];
}

/**
 * Seeding strategy for bye generation (Issue #15)
 */
export type ByeSeedingStrategy = 'top-seeds' | 'random' | 'custom';
