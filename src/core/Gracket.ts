import type {
  GracketOptions,
  GracketSettings,
  TournamentData,
  Team,
  LabelOffset,
  AdvanceOptions,
  AutoGenerateOptions,
  MatchResult,
  TeamHistory,
  TournamentReport,
  TournamentStatistics,
  ReportOptions,
} from '../types';
import {
  isByeGame,
  getMatchWinner as getGameWinner,
  isRoundComplete as checkRoundComplete,
  collectWinners,
  generateNextRound,
  validateRoundComplete,
} from '../utils/tournament';
import {
  getAdvancingTeams as collectAdvancingTeams,
  getRoundResults as collectRoundResults,
  buildTeamHistory,
  generateTournamentReport,
  calculateStatistics,
  formatReportAsText,
  formatReportAsMarkdown,
  formatReportAsHTML,
} from '../utils/reporting';

/**
 * Main Gracket class - Modern, framework-agnostic tournament bracket renderer
 */
export class Gracket {
  private container: HTMLElement;
  private data: TournamentData;
  private settings: GracketSettings;
  private maxRoundWidth: number[] = [];
  private canvas: HTMLCanvasElement | null = null;

  /** Default configuration */
  private static readonly defaults = {
    gracketClass: 'g_gracket',
    gameClass: 'g_game',
    roundClass: 'g_round',
    roundLabelClass: 'g_round_label',
    teamClass: 'g_team',
    winnerClass: 'g_winner',
    spacerClass: 'g_spacer',
    currentClass: 'g_current',
    seedClass: 'g_seed',
    cornerRadius: 15,
    canvasId: 'g_canvas',
    canvasClass: 'g_canvas',
    canvasLineColor: '#eee',
    canvasLineCap: 'round' as const,
    canvasLineWidth: 2,
    canvasLineGap: 15,
    roundLabels: [] as string[],
    src: [] as TournamentData,
    // New defaults for Issues #14 & #15
    byeLabel: 'BYE',
    byeClass: 'g_bye',
    showByeGames: true,
  };

  constructor(container: HTMLElement | string, options: GracketOptions = {}) {
    // Handle string selector or element
    this.container =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)!
        : container;

    if (!this.container) {
      throw new Error('Gracket: Container element not found');
    }

    // Merge options with defaults
    this.settings = {
      ...Gracket.defaults,
      ...options,
      canvasId: `${options.canvasId || Gracket.defaults.canvasId}_${Date.now()}`,
    };

    // Get data from options or data attribute
    this.data = this.settings.src.length
      ? this.settings.src
      : this.parseDataAttribute();

    if (!this.data.length) {
      throw new Error('Gracket: No tournament data provided');
    }

    this.init();
  }

  /** Parse data from data attribute */
  private parseDataAttribute(): TournamentData {
    const dataAttr = this.container.getAttribute('data-gracket');
    if (!dataAttr) return [];

    try {
      return JSON.parse(dataAttr);
    } catch (error) {
      console.error('Gracket: Failed to parse data attribute', error);
      return [];
    }
  }

  /** Initialize the bracket */
  private init(): void {
    // Clear container and add class
    this.container.innerHTML = '';
    this.container.classList.add(this.settings.gracketClass);

    // Create and append canvas
    this.canvas = this.createCanvas();
    this.container.appendChild(this.canvas);

    // Build the bracket structure
    this.buildBracket();
  }

  /** Create the canvas element */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.id = this.settings.canvasId;
    canvas.className = this.settings.canvasClass;
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      right: 'auto',
    });
    return canvas;
  }

  /** Build the bracket structure */
  private buildBracket(): void {
    const roundCount = this.data.length;

    for (let r = 0; r < roundCount; r++) {
      const roundEl = this.createRound();
      this.container.appendChild(roundEl);

      const games = this.data[r];
      const gameCount = games.length;

      for (let g = 0; g < gameCount; g++) {
        const gameEl = this.createGame();
        const outerHeight = this.getGameOuterHeight();

        // Add spacer for rounds after first
        if (g % 1 === 0 && r !== 0) {
          const spacer = this.createSpacer(outerHeight, r, g === 0);
          roundEl.appendChild(spacer);
        }

        roundEl.appendChild(gameEl);

        // Build teams in game
        const teams = games[g];
        const teamCount = teams.length;
        const isBye = isByeGame(teams) && r !== roundCount - 1; // Byes only in non-final rounds

        // Handle bye games (Issue #15)
        if (isBye && teamCount === 1) {
          // Add team
          const teamEl = this.createTeam(teams[0]);
          gameEl.appendChild(teamEl);

          // Add bye placeholder if showByeGames is enabled
          if (this.settings.showByeGames) {
            const byeEl = this.createByePlaceholder();
            gameEl.appendChild(byeEl);
          }

          // Track maximum round width
          const teamWidth = this.getOuterWidth(teamEl);
          if (!this.maxRoundWidth[r] || this.maxRoundWidth[r] < teamWidth) {
            this.maxRoundWidth[r] = teamWidth;
          }
        } else {
          // Regular match or winner display
          for (let t = 0; t < teamCount; t++) {
            const teamEl = this.createTeam(teams[t]);
            gameEl.appendChild(teamEl);

            // Track maximum round width
            const teamWidth = this.getOuterWidth(teamEl);
            if (!this.maxRoundWidth[r] || this.maxRoundWidth[r] < teamWidth) {
              this.maxRoundWidth[r] = teamWidth;
            }

            // Handle winner (single team in final round)
            if (teamCount === 1 && r === roundCount - 1) {
              const prevSpacer = gameEl.previousElementSibling;
              prevSpacer?.remove();

              const prevRound = roundEl.previousElementSibling;
              const firstGame = prevRound?.children[0] as HTMLElement;
              if (firstGame) {
                this.alignWinner(gameEl, firstGame.offsetHeight);
              }
            }
          }
        }
      }
    }

    // Setup interactivity for all brackets
    this.setupInteractivity();
    
    // Draw canvas and labels for all brackets
    if (this.data.length >= 1) {
      const firstRound = this.container.querySelectorAll(`.${this.settings.roundClass}`)[0];
      const firstGame = firstRound?.querySelector(`.${this.settings.gameClass}`) as HTMLElement;
      if (firstGame) {
        this.resizeCanvas();
        this.drawCanvas(firstGame);
      }
    }
  }

  /** Create a round element */
  private createRound(): HTMLElement {
    const div = document.createElement('div');
    div.className = this.settings.roundClass;
    return div;
  }

  /** Create a game element */
  private createGame(): HTMLElement {
    const div = document.createElement('div');
    div.className = this.settings.gameClass;
    return div;
  }

  /** Create a team element */
  private createTeam(team: Team): HTMLElement {
    const div = document.createElement('div');
    div.className = `${this.settings.teamClass} ${team.id || 'id_null'}`;

    const scoreTitle = team.score !== undefined ? ` title="Score: ${team.score}"` : '';
    const displaySeed = team.displaySeed ?? team.seed;
    const scoreDisplay = team.score !== undefined 
      ? `<small class="g_score">${team.score}</small>` 
      : '<small class="g_score g_score-empty">—</small>';

    div.innerHTML = `
      <h3${scoreTitle}>
        <span class="${this.settings.seedClass}">${displaySeed}</span>
        <span class="g_team-name">${team.name}</span>
        ${scoreDisplay}
      </h3>
    `;

    return div;
  }

  /** Create a bye placeholder element (Issue #15) */
  private createByePlaceholder(): HTMLElement {
    const div = document.createElement('div');
    div.className = `${this.settings.teamClass} ${this.settings.byeClass}`;

    div.innerHTML = `
      <h3>
        <span class="g_team-name">${this.settings.byeLabel}</span>
      </h3>
    `;

    return div;
  }

  /** Create a spacer element */
  private createSpacer(yOffset: number, round: number, isFirst: boolean): HTMLElement {
    const div = document.createElement('div');
    div.className = this.settings.spacerClass;

    const height = isFirst
      ? (Math.pow(2, round) - 1) * (yOffset / 2)
      : (Math.pow(2, round) - 1) * yOffset;

    div.style.height = `${height}px`;
    return div;
  }

  /** Align winner position */
  private alignWinner(gameEl: HTMLElement, yOffset: number): void {
    const parent = gameEl.parentElement;
    const isOneGame = parent?.parentElement?.querySelectorAll(':scope > div:not(canvas)').length === 1;
    
    // Account for winner container padding (20px top + 20px bottom = 40px)
    const winnerPadding = 40;
    const offset = isOneGame
      ? yOffset - (gameEl.offsetHeight + gameEl.offsetHeight / 2) - (winnerPadding / 2)
      : yOffset + gameEl.offsetHeight / 2 - (winnerPadding / 2);

    gameEl.classList.add(this.settings.winnerClass);
    gameEl.style.marginTop = `${offset}px`;
  }

  /** Setup hover listeners and interactivity */
  private setupInteractivity(): void {
    const teams = this.container.querySelectorAll(`.${this.settings.teamClass} > h3`);

    teams.forEach((teamH3) => {
      const teamDiv = teamH3.parentElement as HTMLElement;
      const classes = teamDiv.className.split(' ');
      const idClass = classes[1];

      if (idClass && idClass !== 'id_null') {
        const selector = `.${idClass}`;
        const matchingTeams = this.container.querySelectorAll(selector);

        matchingTeams.forEach((el) => {
          el.addEventListener('mouseenter', () => {
            matchingTeams.forEach((t) => t.classList.add(this.settings.currentClass));
          });

          el.addEventListener('mouseleave', () => {
            matchingTeams.forEach((t) => t.classList.remove(this.settings.currentClass));
          });
        });
      }
    });
  }

  /** Resize canvas to container size */
  private resizeCanvas(): void {
    if (!this.canvas) return;

    const height = this.container.offsetHeight;
    const width = this.container.offsetWidth;

    this.canvas.height = height;
    this.canvas.width = width;

    Object.assign(this.canvas.style, {
      height: `${height}px`,
      width: `${width}px`,
      zIndex: '1',
      pointerEvents: 'none',
    });
  }

  /** Draw bracket lines on canvas */
  private drawCanvas(gameEl: HTMLElement): void {
    const itemWidth = this.maxRoundWidth[0] || 0;
    const paddingLeft = parseInt(getComputedStyle(this.container).paddingLeft) || 0;
    const paddingTop = parseInt(getComputedStyle(this.container).paddingTop) || 0;
    const marginRight = parseInt(getComputedStyle(gameEl.parentElement!).marginRight) || 0;

    // Always draw labels first, even if canvas drawing fails
    this.drawLabels({
      padding: paddingLeft,
      left: itemWidth + paddingLeft,
      right: marginRight,
      labels: this.settings.roundLabels,
      class: this.settings.roundLabelClass,
      width: itemWidth,
    });

    // Exit early if canvas or context not available
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Exit early if we don't have enough children for drawing
    if (!gameEl.children[1]) return;

    const itemHeight = this.getGameOuterHeight();
    let cornerRadius = this.settings.cornerRadius;
    let lineGap = this.settings.canvasLineGap;

    // Constraints on corner radius and line gap
    cornerRadius = Math.max(1, Math.min(cornerRadius, itemHeight / 3, marginRight / 2 - 2));
    lineGap = Math.min(lineGap, marginRight / 3);

    const playerGap = gameEl.offsetHeight - 2 * (gameEl.children[1] as HTMLElement).offsetHeight;
    const playerHt = (gameEl.children[1] as HTMLElement).offsetHeight;

    // Set canvas styles
    ctx.strokeStyle = this.settings.canvasLineColor;
    ctx.lineCap = this.settings.canvasLineCap;
    ctx.lineWidth = this.settings.canvasLineWidth;
    ctx.beginPath();

    let p = Math.pow(2, this.data.length - 2);
    let i = 0;
    let totalItemWidth = 0;
    const startingLeftPos = itemWidth + paddingLeft;

    while (p >= 1) {
      for (let j = 0; j < p; j++) {
        const r = p === 1 ? 1 : 0.5;
        const xInit = startingLeftPos + totalItemWidth + i * marginRight;
        const xDisp = r * marginRight;
        const yInit =
          ((Math.pow(2, i - 1) - 0.5) * (i && 1) + j * Math.pow(2, i)) * itemHeight +
          paddingTop +
          playerHt +
          playerGap / 2;

        if (p > 1) {
          // Top bracket horizontal line
          ctx.moveTo(xInit + lineGap, yInit);
          ctx.lineTo(xInit + xDisp - cornerRadius, yInit);
        } else {
          // Winner horizontal line
          ctx.moveTo(xInit + lineGap, yInit);
          ctx.lineTo(xInit + 3 * lineGap, yInit);
        }

        // Connecting lines
        if (p > 1 && j % 2 === 0) {
          const yTop = yInit + cornerRadius;
          const yBottom = yInit + Math.pow(2, i) * itemHeight - cornerRadius;

          // Vertical line
          ctx.moveTo(xInit + xDisp, yTop);
          ctx.lineTo(xInit + xDisp, yBottom);

          // Rounded corners
          const cx = xInit + xDisp - cornerRadius;
          let cy = yInit + cornerRadius;

          ctx.moveTo(cx, cy - cornerRadius);
          ctx.arcTo(cx + cornerRadius, cy - cornerRadius, cx + cornerRadius, cy, cornerRadius);

          cy = yInit + Math.pow(2, i) * itemHeight - cornerRadius;
          ctx.moveTo(cx + cornerRadius, cy - cornerRadius);
          ctx.arcTo(cx + cornerRadius, cy + cornerRadius, cx, cy + cornerRadius, cornerRadius);

          const yMiddle = (yTop + yBottom) / 2;
          ctx.moveTo(xInit + xDisp, yMiddle);
          ctx.lineTo(xInit + xDisp + lineGap, yMiddle);
        }
      }

      i++;
      totalItemWidth += this.maxRoundWidth[i] || 0;
      p = p / 2;
    }

    ctx.stroke();
  }

  /** Draw round labels */
  private drawLabels(offset: LabelOffset): void {
    let widthPadding = 0;

    for (let i = 0; i < this.data.length; i++) {
      const roundWidth = this.maxRoundWidth[i] || 0;
      const left = i === 0
        ? offset.padding + widthPadding + (roundWidth / 2)
        : offset.padding + widthPadding + offset.right * i + (roundWidth / 2);

      const label = document.createElement('h5');
      label.innerHTML = offset.labels.length ? offset.labels[i] : `Round ${i + 1}`;
      label.className = offset.class;

      Object.assign(label.style, {
        position: 'absolute',
        left: `${left}px`,
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
      });

      this.container.appendChild(label);
      widthPadding += roundWidth;
    }
  }

  /** Get outer height of game element including margins */
  private getGameOuterHeight(): number {
    const games = this.container.querySelectorAll(`.${this.settings.gameClass}`);
    if (!games.length) return 0;

    const game = games[0] as HTMLElement;
    const style = getComputedStyle(game);
    const marginTop = parseInt(style.marginTop) || 0;
    const marginBottom = parseInt(style.marginBottom) || 0;

    return game.offsetHeight + marginTop + marginBottom;
  }

  /** Get outer width including margins */
  private getOuterWidth(el: HTMLElement): number {
    const style = getComputedStyle(el);
    const marginLeft = parseInt(style.marginLeft) || 0;
    const marginRight = parseInt(style.marginRight) || 0;
    return el.offsetWidth + marginLeft + marginRight;
  }

  /** Update tournament data and re-render */
  public update(data: TournamentData): void {
    this.data = data;
    this.maxRoundWidth = [];
    this.init();
  }

  /** Destroy the bracket and clean up */
  public destroy(): void {
    this.container.innerHTML = '';
    this.container.classList.remove(this.settings.gracketClass);
  }

  /** Get current settings */
  public getSettings(): Readonly<GracketSettings> {
    return { ...this.settings };
  }

  /** Get current tournament data */
  public getData(): Readonly<TournamentData> {
    return [...this.data];
  }

  // ===================================================================
  // NEW METHODS FOR ISSUES #14 & #15
  // ===================================================================

  // -------------------------------------------------------------------
  // Score Management Methods (Issue #14a)
  // -------------------------------------------------------------------

  /**
   * Update a team's score in a specific match
   * @param roundIndex - Round index (0-based)
   * @param gameIndex - Game index within round (0-based)
   * @param teamIndex - Team index within game (0 or 1)
   * @param score - New score value
   */
  public updateScore(
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void {
    if (roundIndex < 0 || roundIndex >= this.data.length) {
      throw new Error(`Invalid round index: ${roundIndex}`);
    }

    const round = this.data[roundIndex];
    if (gameIndex < 0 || gameIndex >= round.length) {
      throw new Error(`Invalid game index: ${gameIndex} in round ${roundIndex}`);
    }

    const game = round[gameIndex];
    if (teamIndex < 0 || teamIndex >= game.length) {
      throw new Error(`Invalid team index: ${teamIndex} in round ${roundIndex}, game ${gameIndex}`);
    }

    // Update score
    game[teamIndex].score = score;

    // Fire callback if provided
    if (this.settings.onScoreUpdate) {
      this.settings.onScoreUpdate(roundIndex, gameIndex, teamIndex, score);
    }

    // Re-render to show updated score
    this.init();
  }

  /**
   * Get the winner of a specific match
   * @param roundIndex - Round index (0-based)
   * @param gameIndex - Game index within round (0-based)
   * @returns Winning team or null if match is not complete
   */
  public getMatchWinner(roundIndex: number, gameIndex: number): Team | null {
    if (roundIndex < 0 || roundIndex >= this.data.length) {
      return null;
    }

    const round = this.data[roundIndex];
    if (gameIndex < 0 || gameIndex >= round.length) {
      return null;
    }

    return getGameWinner(round[gameIndex]);
  }

  /**
   * Check if all matches in a round are complete
   * @param roundIndex - Round index (0-based)
   * @returns True if all matches have determined winners
   */
  public isRoundComplete(roundIndex: number): boolean {
    if (roundIndex < 0 || roundIndex >= this.data.length) {
      return false;
    }

    return checkRoundComplete(this.data[roundIndex]);
  }

  /**
   * Advance winners to the next round
   * @param fromRound - Round index to advance from (default: first incomplete round)
   * @param options - Configuration for advancement behavior
   * @returns Updated tournament data
   */
  public advanceRound(fromRound?: number, options: AdvanceOptions = {}): TournamentData {
    // Determine which round to advance from
    let roundIndex = fromRound;
    if (roundIndex === undefined) {
      // Find first incomplete round
      roundIndex = this.data.findIndex((round) => !checkRoundComplete(round));
      if (roundIndex === -1) {
        throw new Error('No incomplete rounds found');
      }
    }

    if (roundIndex < 0 || roundIndex >= this.data.length) {
      throw new Error(`Invalid round index: ${roundIndex}`);
    }

    const round = this.data[roundIndex];

    // Validate round is complete
    const {
      tieBreaker = 'error',
      tieBreakerFn,
      preserveScores = false,
      createRounds = false,
    } = options;

    if (tieBreaker === 'error') {
      validateRoundComplete(round, roundIndex);
    }

    // Collect winners
    const winners = collectWinners(round, tieBreaker, tieBreakerFn);

    // Generate next round
    const nextRound = generateNextRound(winners, preserveScores);

    // Add or update next round
    if (roundIndex + 1 < this.data.length) {
      // Update existing round
      this.data[roundIndex + 1] = nextRound;
    } else if (createRounds) {
      // Create new round
      this.data.push(nextRound);
    } else {
      throw new Error(`Round ${roundIndex + 2} does not exist. Use createRounds: true to create it.`);
    }

    // Fire callback if provided
    if (this.settings.onRoundComplete) {
      this.settings.onRoundComplete(roundIndex);
    }

    if (this.settings.onRoundGenerated) {
      this.settings.onRoundGenerated(roundIndex + 1, nextRound);
    }

    // Re-render bracket
    this.init();

    return this.data;
  }

  /**
   * Auto-generate entire tournament from results
   * Automatically advances through all completed rounds
   * @param options - Configuration options
   */
  public autoGenerateTournament(options: AutoGenerateOptions = {}): void {
    const { stopAtRound, onRoundGenerated, ...advanceOptions } = options;

    let currentRound = 0;

    while (currentRound < this.data.length) {
      // Check if this round is complete
      if (!checkRoundComplete(this.data[currentRound])) {
        break; // Stop at first incomplete round
      }

      // Check if we should stop here
      if (stopAtRound !== undefined && currentRound >= stopAtRound) {
        break;
      }

      // Check if we're at the end
      if (currentRound === this.data.length - 1) {
        break; // Last round, can't advance further
      }

      try {
        // Advance to next round
        this.advanceRound(currentRound, {
          ...advanceOptions,
          createRounds: true,
        });

        // Fire custom callback if provided
        if (onRoundGenerated) {
          onRoundGenerated(currentRound + 1, this.data[currentRound + 1]);
        }
      } catch (error) {
        console.error(`Failed to advance round ${currentRound}:`, error);
        break;
      }

      currentRound++;
    }
  }

  // -------------------------------------------------------------------
  // Reporting & Query Methods (Issue #14b)
  // -------------------------------------------------------------------

  /**
   * Get teams advancing from a specific round
   * @param roundIndex - Round index (default: latest round with results)
   * @returns Array of teams advancing to next round
   */
  public getAdvancingTeams(roundIndex?: number): Team[] {
    let idx = roundIndex;

    if (idx === undefined) {
      // Find latest round with complete results
      for (let i = this.data.length - 1; i >= 0; i--) {
        if (checkRoundComplete(this.data[i])) {
          idx = i;
          break;
        }
      }

      if (idx === undefined) {
        return []; // No complete rounds
      }
    }

    if (idx < 0 || idx >= this.data.length) {
      return [];
    }

    return collectAdvancingTeams(this.data[idx]);
  }

  /**
   * Get detailed results for a round
   * @param roundIndex - Round index
   * @returns Array of match results with winners and losers
   */
  public getRoundResults(roundIndex: number): MatchResult[] {
    if (roundIndex < 0 || roundIndex >= this.data.length) {
      return [];
    }

    return collectRoundResults(this.data[roundIndex]);
  }

  /**
   * Get a team's tournament history
   * @param teamId - Team identifier
   * @returns Complete history of team's matches
   */
  public getTeamHistory(teamId: string): TeamHistory | null {
    return buildTeamHistory(teamId, this.data, this.settings.roundLabels);
  }

  /**
   * Get tournament statistics
   * @returns Various tournament statistics
   */
  public getStatistics(): TournamentStatistics {
    return calculateStatistics(this.data);
  }

  /**
   * Generate a tournament report
   * @param options - Reporting options
   * @returns Formatted tournament report
   */
  public generateReport(options: ReportOptions = {}): TournamentReport | string {
    const {
      format = 'json',
      includeScores = true,
      includeStatistics = false,
    } = options;

    const report = generateTournamentReport(
      this.data,
      this.settings.roundLabels,
      includeStatistics
    );

    // Return in requested format
    switch (format) {
      case 'json':
        return report;

      case 'text':
        return formatReportAsText(report, includeScores);

      case 'html':
        return formatReportAsHTML(report, includeScores);

      case 'markdown':
        return formatReportAsMarkdown(report, includeScores);

      default:
        throw new Error(`Unknown report format: ${format}`);
    }
  }
}
