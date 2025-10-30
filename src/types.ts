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
}

/**
 * Internal settings (merged defaults + options)
 */
export interface GracketSettings extends Required<GracketOptions> {
  canvasId: string;
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
