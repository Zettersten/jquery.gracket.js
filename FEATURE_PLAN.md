# Feature Plan: Byes, Auto-Rounds, and Reporting

## Overview
This document outlines a comprehensive plan to add three major features to Gracket:
1. **Byes Support** (Issue #15) - Handle tournaments where participant count isn't a power of 2
2. **Auto-Round Generation** (Issue #14a) - Automatically generate next round brackets based on results
3. **Reporting/Advancement** (Issue #14b) - Query and report which teams advance to next rounds

## Design Principles
- **Backward Compatibility**: Maintain existing API - all current code should work without changes
- **Progressive Enhancement**: New features are opt-in
- **Type Safety**: Full TypeScript support with proper types
- **Simplicity**: Easy to use for common cases, flexible for advanced cases

---

## Feature 1: Byes Support (Issue #15)

### Problem
Single-elimination tournaments often have participant counts that aren't powers of 2 (e.g., 5, 6, 7, 9, 10 teams). In these cases, some teams receive "byes" - automatic advancement to the next round without playing in round 1.

### Solution Design

#### Data Structure
Allow games in the first round to have only **one team** to represent a bye. This maintains backward compatibility while being intuitive.

```typescript
// Example: 6-team tournament
const tournamentWith6Teams: TournamentData = [
  // Round 1 - only 4 teams play, 2 get byes
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team H', seed: 8, score: 85 }
    ],
    [
      { name: 'Team D', seed: 4, score: 90 },
      { name: 'Team E', seed: 5, score: 88 }
    ],
    // These are byes - single team per game
    [{ name: 'Team B', seed: 2 }],  // Bye
    [{ name: 'Team C', seed: 3 }],  // Bye
  ],
  // Round 2 - all 4 teams play normally
  [
    [
      { name: 'Team A', seed: 1, score: 95 },
      { name: 'Team B', seed: 2, score: 88 }  // Team B advanced via bye
    ],
    [
      { name: 'Team D', seed: 4, score: 92 },
      { name: 'Team C', seed: 3, score: 90 }  // Team C advanced via bye
    ]
  ],
  // ... finals
];
```

#### Visual Representation
- Single-team games in round 1 display as "BYE" opponent
- Use a special CSS class: `g_bye`
- Visual styling shows "awaiting opponent" or "BYE" placeholder
- Connecting line shows direct advancement to next round

#### API Changes

**New Options:**
```typescript
interface GracketOptions {
  // ... existing options
  byeLabel?: string;           // Default: 'BYE'
  byeClass?: string;           // CSS class for bye placeholder
  showByeGames?: boolean;      // Show bye games or hide them (default: true)
}
```

**Helper Utility:**
```typescript
/**
 * Generate tournament structure with byes for non-power-of-2 team counts
 * @param teams - Array of teams (can be any count >= 2)
 * @param seedingStrategy - How to assign byes ('top-seeds' | 'random' | 'custom')
 * @returns Tournament data with proper bye structure
 */
function generateTournamentWithByes(
  teams: Team[],
  seedingStrategy?: 'top-seeds' | 'random' | 'custom'
): TournamentData;
```

#### Implementation Details

1. **Detection Logic**: Check if `game.length === 1` in rendering
2. **Bye Placeholder Creation**: Generate visual bye opponent
3. **Canvas Drawing**: Adjust line drawing for bye connections
4. **Spacing Calculation**: Account for visual bye representation

---

## Feature 2: Auto-Round Generation (Issue #14a)

### Problem
Users want to enter match results and have the next round bracket automatically populated with winners, eliminating manual data management.

### Solution Design

#### Core Concept
Add methods to:
1. Determine match winners based on scores
2. Automatically populate next round with winners
3. Validate that matches are complete before advancing

#### API Design

**New Methods on Gracket Class:**

```typescript
class Gracket {
  /**
   * Advance winners to the next round based on current scores
   * @param fromRound - Round index to advance from (default: current incomplete round)
   * @param options - Configuration for advancement behavior
   * @returns Updated tournament data
   * @throws Error if scores are incomplete or tied
   */
  advanceRound(fromRound?: number, options?: AdvanceOptions): TournamentData;

  /**
   * Get the winner of a specific match
   * @param roundIndex - Round index (0-based)
   * @param gameIndex - Game index within round (0-based)
   * @returns Winning team or null if no winner yet
   */
  getMatchWinner(roundIndex: number, gameIndex: number): Team | null;

  /**
   * Check if a round is complete (all games have winners)
   * @param roundIndex - Round index to check
   * @returns True if all games in round have determined winners
   */
  isRoundComplete(roundIndex: number): boolean;

  /**
   * Update a single match score
   * @param roundIndex - Round index
   * @param gameIndex - Game index
   * @param teamIndex - Team index within game (0 or 1)
   * @param score - New score value
   */
  updateScore(
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void;

  /**
   * Auto-populate the entire tournament from just first round results
   * Automatically calls advanceRound for each completed round
   * @param options - Configuration options
   */
  autoGenerateTournament(options?: AutoGenerateOptions): void;
}
```

**New Type Definitions:**

```typescript
interface AdvanceOptions {
  /** How to handle tied scores */
  tieBreaker?: 'error' | 'higher-seed' | 'lower-seed' | 'callback';
  /** Custom tie-breaking function */
  tieBreakerFn?: (team1: Team, team2: Team) => Team;
  /** Preserve scores when advancing (default: false - clear scores) */
  preserveScores?: boolean;
  /** Auto-generate subsequent rounds if they don't exist */
  createRounds?: boolean;
}

interface AutoGenerateOptions extends AdvanceOptions {
  /** Callback fired when each round is generated */
  onRoundGenerated?: (roundIndex: number, roundData: Round) => void;
  /** Stop at specific round (useful for manual intervention) */
  stopAtRound?: number;
}

interface MatchResult {
  winner: Team;
  loser: Team;
  winnerScore?: number;
  loserScore?: number;
  isBye: boolean;
}
```

#### Usage Examples

**Example 1: Manual Round Advancement**
```typescript
const bracket = new Gracket('#bracket', { src: initialData });

// User enters scores through UI
bracket.updateScore(0, 0, 0, 95);  // Team A: 95
bracket.updateScore(0, 0, 1, 88);  // Team B: 88

// Check if round is complete
if (bracket.isRoundComplete(0)) {
  // Advance winners to next round
  bracket.advanceRound(0, {
    tieBreaker: 'higher-seed',
    createRounds: true  // Create round 2 if it doesn't exist
  });
}
```

**Example 2: Auto-Generation**
```typescript
// Define only first round with scores
const firstRoundData: TournamentData = [
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team B', seed: 8, score: 85 }
    ],
    [
      { name: 'Team C', seed: 4, score: 90 },
      { name: 'Team D', seed: 5, score: 88 }
    ]
  ]
];

const bracket = new Gracket('#bracket', { src: firstRoundData });

// Automatically generate all subsequent rounds
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  onRoundGenerated: (roundIndex, roundData) => {
    console.log(`Round ${roundIndex + 1} generated:`, roundData);
  }
});

// Result: Tournament structure is fully populated with winners
```

**Example 3: Interactive Score Entry**
```typescript
const bracket = new Gracket('#bracket', {
  src: initialData,
  onScoreUpdate: (roundIndex, gameIndex, teamIndex, score) => {
    // Check if this match is now complete
    const game = bracket.getData()[roundIndex][gameIndex];
    const bothScored = game.every(team => team.score !== undefined);
    
    if (bothScored) {
      const winner = bracket.getMatchWinner(roundIndex, gameIndex);
      console.log(`Match complete! Winner: ${winner?.name}`);
      
      // Optionally auto-advance
      if (bracket.isRoundComplete(roundIndex)) {
        bracket.advanceRound(roundIndex);
      }
    }
  }
});
```

#### Implementation Strategy

1. **Winner Determination Logic**
   - Compare scores (highest wins)
   - Handle byes (single team = auto-winner)
   - Apply tie-breaking rules
   - Validate data completeness

2. **Round Generation**
   - Collect winners from previous round
   - Create game pairings (winner[0] vs winner[1], winner[2] vs winner[3], etc.)
   - Clear scores (unless preserveScores option is true)
   - Maintain team IDs for tracking

3. **Data Validation**
   - Ensure scores exist before determining winners
   - Validate round structure (games must pair correctly)
   - Handle edge cases (odd number of winners)

---

## Feature 3: Reporting & Advancement Queries (Issue #14b)

### Problem
Users need to query tournament state, see who's advancing, generate reports, and track team progress through rounds.

### Solution Design

#### Reporting API

**New Methods:**

```typescript
class Gracket {
  /**
   * Get all teams advancing from a specific round
   * @param roundIndex - Round to get advancing teams from (default: latest round with results)
   * @returns Array of teams advancing to next round
   */
  getAdvancingTeams(roundIndex?: number): Team[];

  /**
   * Get detailed results for a round
   * @param roundIndex - Round index
   * @returns Array of match results with winners and losers
   */
  getRoundResults(roundIndex: number): MatchResult[];

  /**
   * Get a team's tournament path/history
   * @param teamId - Team identifier
   * @returns Array of all matches the team participated in
   */
  getTeamHistory(teamId: string): TeamHistory;

  /**
   * Generate a tournament report
   * @param options - Reporting options
   * @returns Formatted tournament report
   */
  generateReport(options?: ReportOptions): TournamentReport;

  /**
   * Get tournament statistics
   * @returns Various tournament statistics
   */
  getStatistics(): TournamentStatistics;
}
```

**New Type Definitions:**

```typescript
interface TeamHistory {
  team: Team;
  matches: MatchEntry[];
  finalPlacement?: number;  // 1st, 2nd, 3rd, etc.
  wins: number;
  losses: number;
}

interface MatchEntry {
  roundIndex: number;
  roundLabel: string;
  opponent: Team | null;  // null for bye
  won: boolean;
  score?: number;
  opponentScore?: number;
  isBye: boolean;
}

interface TournamentReport {
  totalRounds: number;
  totalMatches: number;
  completedMatches: number;
  remainingMatches: number;
  currentRound: number;
  champion?: Team;
  finalists?: Team[];
  allResults: RoundReport[];
}

interface RoundReport {
  roundIndex: number;
  roundLabel: string;
  isComplete: boolean;
  matches: MatchResult[];
  advancingTeams: Team[];
}

interface TournamentStatistics {
  participantCount: number;
  totalRounds: number;
  byeCount: number;
  averageScore?: number;
  highestScore?: { team: Team; score: number; round: number };
  completionPercentage: number;
}

interface ReportOptions {
  format?: 'json' | 'text' | 'html' | 'markdown';
  includeScores?: boolean;
  includeStatistics?: boolean;
  roundLabels?: string[];
}
```

#### Usage Examples

**Example 1: Get Advancing Teams**
```typescript
const bracket = new Gracket('#bracket', { src: tournamentData });

// Get teams advancing from round 1
const advancingTeams = bracket.getAdvancingTeams(0);
console.log('Advancing to Round 2:', advancingTeams.map(t => t.name));

// Output: "Advancing to Round 2: ['Team A', 'Team C', 'Team B (BYE)', 'Team D']"
```

**Example 2: Get Team History**
```typescript
const history = bracket.getTeamHistory('team-a');
console.log(`${history.team.name} - ${history.wins}W / ${history.losses}L`);

history.matches.forEach(match => {
  const result = match.won ? 'Won' : 'Lost';
  const vs = match.isBye ? 'BYE' : match.opponent?.name;
  console.log(`  ${match.roundLabel}: ${result} vs ${vs} (${match.score}-${match.opponentScore})`);
});

// Output:
// Team A - 3W / 0L
//   Round 1: Won vs Team B (100-85)
//   Round 2: Won vs Team C (95-88)
//   Finals: Won vs Team D (102-98)
```

**Example 3: Generate Tournament Report**
```typescript
const report = bracket.generateReport({
  format: 'text',
  includeScores: true,
  includeStatistics: true
});

console.log(report);

// Output:
// =================================
// TOURNAMENT REPORT
// =================================
// Total Participants: 8
// Total Rounds: 4
// Completed Matches: 7/7 (100%)
//
// ROUND 1 (Quarter Finals)
// ✓ Match 1: Team A (100) defeated Team B (85)
// ✓ Match 2: Team C (90) defeated Team D (88)
// ✓ Match 3: Team E (BYE) - advanced
// ✓ Match 4: Team F (BYE) - advanced
//
// Advancing: Team A, Team C, Team E, Team F
//
// ROUND 2 (Semi Finals)
// ...
//
// CHAMPION: Team A
// =================================
```

**Example 4: Real-time Progress Tracking**
```typescript
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  onRoundComplete: (roundIndex) => {
    const results = bracket.getRoundResults(roundIndex);
    const advancing = bracket.getAdvancingTeams(roundIndex);
    
    // Show notification
    showNotification({
      title: `Round ${roundIndex + 1} Complete!`,
      message: `${advancing.length} teams advance to the next round`,
      details: results.map(r => `${r.winner.name} defeats ${r.loser.name}`)
    });
  }
});
```

**Example 5: Export Report for External Use**
```typescript
// Generate markdown report for documentation
const mdReport = bracket.generateReport({ format: 'markdown' });
downloadFile('tournament-results.md', mdReport);

// Generate JSON for API
const jsonReport = bracket.generateReport({ format: 'json' });
fetch('/api/tournaments', {
  method: 'POST',
  body: JSON.stringify(jsonReport)
});

// Generate HTML for embedding
const htmlReport = bracket.generateReport({ format: 'html' });
document.getElementById('report-container').innerHTML = htmlReport;
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Foundation)
**Goal**: Add utility functions and type definitions without breaking changes

1. Create new types in `types.ts`:
   - `AdvanceOptions`
   - `AutoGenerateOptions`
   - `MatchResult`
   - `TeamHistory`
   - `TournamentReport`
   - `RoundReport`
   - `TournamentStatistics`
   - `ReportOptions`

2. Create utility module `src/utils/tournament.ts`:
   - `getMatchWinner(game: Game): Team | null`
   - `isRoundComplete(round: Round): boolean`
   - `isByeGame(game: Game): boolean`
   - `validateScores(round: Round): boolean`
   - `applyTieBreaker(team1: Team, team2: Team, strategy: string): Team`

3. Add tests for utilities

### Phase 2: Byes Support (Issue #15)
**Goal**: Visual and structural support for byes

1. Update `Gracket.ts`:
   - Add `byeLabel`, `byeClass`, `showByeGames` to options
   - Modify `createTeam()` to detect single-team games
   - Add `createByePlaceholder()` method
   - Update `drawCanvas()` to handle bye connections
   - Update `setupInteractivity()` to skip bye placeholders

2. Create bye placeholder element:
   - Visual styling for "BYE" opponent
   - Special CSS class handling
   - Proper spacing/alignment

3. Update `generateTournamentData()` helper to support byes

4. Add tests for bye scenarios

5. Update documentation and demo

### Phase 3: Auto-Round Generation (Issue #14a)
**Goal**: Add methods for automatic advancement

1. Add methods to `Gracket.ts`:
   - `getMatchWinner(roundIndex, gameIndex)`
   - `isRoundComplete(roundIndex)`
   - `updateScore(roundIndex, gameIndex, teamIndex, score)`
   - `advanceRound(fromRound?, options?)`
   - `autoGenerateTournament(options?)`

2. Implement round generation logic:
   - Winner collection
   - Next round structure creation
   - Data validation
   - Error handling

3. Add event system:
   - `onScoreUpdate` callback
   - `onRoundComplete` callback
   - `onRoundGenerated` callback

4. Add comprehensive tests

5. Update documentation with examples

### Phase 4: Reporting & Queries (Issue #14b)
**Goal**: Add reporting and analysis capabilities

1. Add query methods to `Gracket.ts`:
   - `getAdvancingTeams(roundIndex?)`
   - `getRoundResults(roundIndex)`
   - `getTeamHistory(teamId)`
   - `getStatistics()`

2. Implement reporting system:
   - `generateReport(options?)` method
   - Format handlers (JSON, text, HTML, markdown)
   - Template system for report generation

3. Add comprehensive tests

4. Create reporting examples in demo

### Phase 5: Polish & Documentation
**Goal**: Ensure production-readiness

1. Update all documentation:
   - README.md with new features
   - API reference for new methods
   - Migration guide
   - Tutorial for common use cases

2. Create interactive demo showcasing:
   - Byes in action
   - Real-time score entry
   - Auto-generation
   - Report generation

3. Add TypeScript examples for all features

4. Performance testing and optimization

5. Final integration tests

---

## Backward Compatibility

### No Breaking Changes
- All existing APIs remain unchanged
- New features are opt-in via new methods
- Default behavior is identical to current version
- Existing tournament data structures work as-is

### Graceful Degradation
- Byes work with existing data (single-team games)
- Reports work even if round structure is incomplete
- Methods return sensible defaults for incomplete data

---

## Testing Strategy

### Unit Tests
- Bye detection and rendering
- Winner determination logic
- Round advancement logic
- Report generation
- Tie-breaking strategies

### Integration Tests
- Full tournament flow with byes
- Auto-generation from first round
- Report accuracy across scenarios
- Event callback triggering

### Edge Cases
- Tournaments with odd team counts (3, 5, 7, 9, etc.)
- All byes in first round
- Tied scores with various tie-breakers
- Incomplete rounds
- Single-round tournaments

---

## Success Criteria

### Feature 1: Byes (Issue #15)
- ✅ Support any team count (not just powers of 2)
- ✅ Visual representation of byes is clear
- ✅ Byes properly connect to next round visually
- ✅ Helper utility to generate tournament with byes
- ✅ Backward compatible with existing data

### Feature 2: Auto-Generation (Issue #14a)
- ✅ Can advance single round based on scores
- ✅ Can auto-generate entire tournament from first round
- ✅ Proper error handling for incomplete scores
- ✅ Tie-breaking strategies work correctly
- ✅ Event callbacks fire appropriately

### Feature 3: Reporting (Issue #14b)
- ✅ Can query advancing teams for any round
- ✅ Can get complete team history/path
- ✅ Can generate reports in multiple formats
- ✅ Statistics are accurate
- ✅ Reports handle incomplete tournaments gracefully

---

## Example: Complete Workflow

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';
import 'gracket/style.css';

// Step 1: Create tournament with 6 teams (includes byes)
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 },
  { name: 'Suns', id: 'suns', seed: 6 },
];

// Generate tournament structure with byes for top seeds
const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

// Step 2: Initialize bracket
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  byeLabel: 'BYE',
  roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals', 'Champion'],
  
  // Event: Score updated
  onScoreUpdate: (roundIndex, gameIndex, teamIndex, score) => {
    console.log(`Score updated: Round ${roundIndex + 1}, Game ${gameIndex + 1}`);
  },
  
  // Event: Round completed
  onRoundComplete: (roundIndex) => {
    console.log(`Round ${roundIndex + 1} complete!`);
    const advancing = bracket.getAdvancingTeams(roundIndex);
    console.log('Advancing:', advancing.map(t => t.name).join(', '));
  }
});

// Step 3: User enters scores (or load from API)
bracket.updateScore(0, 0, 0, 105);  // Heat: 105
bracket.updateScore(0, 0, 1, 98);   // Bucks: 98
bracket.updateScore(0, 1, 0, 110);  // Suns: 110
bracket.updateScore(0, 1, 1, 102);  // (opponent): 102

// Step 4: Auto-advance to next round
if (bracket.isRoundComplete(0)) {
  bracket.advanceRound(0, {
    tieBreaker: 'higher-seed',
    createRounds: true
  });
}

// Step 5: Get current standings
const report = bracket.generateReport({
  format: 'text',
  includeScores: true
});
console.log(report);

// Step 6: Track specific team
const warriorsHistory = bracket.getTeamHistory('warriors');
console.log(`Warriors: ${warriorsHistory.wins}W-${warriorsHistory.losses}L`);
warriorsHistory.matches.forEach(match => {
  console.log(`  ${match.roundLabel}: ${match.won ? 'W' : 'L'} vs ${match.opponent?.name || 'BYE'}`);
});

// Step 7: Export results
const jsonReport = bracket.generateReport({ format: 'json' });
fetch('/api/tournament-results', {
  method: 'POST',
  body: JSON.stringify(jsonReport)
});
```

---

## Conclusion

This plan provides a comprehensive solution for both GitHub issues while maintaining backward compatibility and providing a natural, intuitive API. The phased implementation approach allows for incremental development and testing, reducing risk and ensuring each feature works correctly before moving to the next.

Key benefits:
- ✅ Solves both issues completely
- ✅ Maintains existing API
- ✅ Provides powerful new capabilities
- ✅ Type-safe with full TypeScript support
- ✅ Well-tested and documented
- ✅ Progressive enhancement approach
