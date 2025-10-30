# API Quick Reference Card

## 🎯 New Features At-a-Glance

### Byes Support (Issue #15)
```typescript
// Single-team games = byes
[{ name: 'Team A', seed: 1 }]

// Helper function
generateTournamentWithByes(teams, 'top-seeds')

// Options
{ byeLabel: 'BYE', byeClass: 'g_bye', showByeGames: true }
```

### Auto-Generation (Issue #14a)
```typescript
// Update scores
bracket.updateScore(roundIdx, gameIdx, teamIdx, score)

// Check completion
bracket.isRoundComplete(roundIdx)

// Get winner
bracket.getMatchWinner(roundIdx, gameIdx)

// Advance round
bracket.advanceRound(roundIdx, { tieBreaker: 'higher-seed', createRounds: true })

// Auto-generate all
bracket.autoGenerateTournament(options)
```

### Reporting (Issue #14b)
```typescript
// Query advancing teams
bracket.getAdvancingTeams(roundIdx?)

// Get round results
bracket.getRoundResults(roundIdx)

// Track team
bracket.getTeamHistory(teamId)

// Generate report
bracket.generateReport({ format: 'json' | 'text' | 'html' | 'markdown' })

// Get stats
bracket.getStatistics()
```

---

## 📚 Complete API Reference

### Constructor
```typescript
new Gracket(container: HTMLElement | string, options?: GracketOptions)
```

### Existing Options (Unchanged)
```typescript
interface GracketOptions {
  src?: TournamentData;
  gracketClass?: string;
  gameClass?: string;
  roundClass?: string;
  teamClass?: string;
  winnerClass?: string;
  spacerClass?: string;
  currentClass?: string;
  seedClass?: string;
  cornerRadius?: number;
  canvasLineColor?: string;
  canvasLineWidth?: number;
  canvasLineGap?: number;
  canvasLineCap?: CanvasLineCap;
  roundLabels?: string[];
}
```

### New Options
```typescript
interface GracketOptions {
  // ... existing options ...
  
  // Byes
  byeLabel?: string;              // Default: 'BYE'
  byeClass?: string;              // CSS class for bye placeholder
  showByeGames?: boolean;         // Show bye games (default: true)
  
  // Events
  onScoreUpdate?: (roundIdx: number, gameIdx: number, teamIdx: number, score: number) => void;
  onRoundComplete?: (roundIdx: number) => void;
  onRoundGenerated?: (roundIdx: number, roundData: Round) => void;
}
```

### Existing Methods (Unchanged)
```typescript
bracket.update(data: TournamentData): void
bracket.destroy(): void
bracket.getSettings(): Readonly<GracketSettings>
bracket.getData(): Readonly<TournamentData>
```

### New Methods: Score Management
```typescript
// Update a team's score
updateScore(
  roundIndex: number,
  gameIndex: number,
  teamIndex: number,
  score: number
): void

// Get winner of a match (null if incomplete or tied)
getMatchWinner(
  roundIndex: number,
  gameIndex: number
): Team | null

// Check if all matches in a round are complete
isRoundComplete(roundIndex: number): boolean
```

### New Methods: Round Advancement
```typescript
// Advance winners to next round
advanceRound(
  fromRound?: number,           // Default: first incomplete round
  options?: AdvanceOptions
): TournamentData

// Auto-generate entire tournament from results
autoGenerateTournament(
  options?: AutoGenerateOptions
): void
```

#### AdvanceOptions
```typescript
interface AdvanceOptions {
  tieBreaker?: 'error' | 'higher-seed' | 'lower-seed' | 'callback';
  tieBreakerFn?: (team1: Team, team2: Team) => Team;
  preserveScores?: boolean;     // Keep scores when advancing (default: false)
  createRounds?: boolean;       // Create next round if missing (default: false)
}
```

#### AutoGenerateOptions
```typescript
interface AutoGenerateOptions extends AdvanceOptions {
  onRoundGenerated?: (roundIndex: number, roundData: Round) => void;
  stopAtRound?: number;         // Stop at specific round
}
```

### New Methods: Reporting & Queries
```typescript
// Get teams advancing from a round
getAdvancingTeams(roundIndex?: number): Team[]

// Get detailed results for a round
getRoundResults(roundIndex: number): MatchResult[]

// Get a team's tournament history
getTeamHistory(teamId: string): TeamHistory

// Generate formatted report
generateReport(options?: ReportOptions): TournamentReport

// Get tournament statistics
getStatistics(): TournamentStatistics
```

#### ReportOptions
```typescript
interface ReportOptions {
  format?: 'json' | 'text' | 'html' | 'markdown';
  includeScores?: boolean;
  includeStatistics?: boolean;
  roundLabels?: string[];
}
```

---

## 📊 New Type Definitions

### MatchResult
```typescript
interface MatchResult {
  winner: Team;
  loser: Team;
  winnerScore?: number;
  loserScore?: number;
  isBye: boolean;
}
```

### TeamHistory
```typescript
interface TeamHistory {
  team: Team;
  matches: MatchEntry[];
  finalPlacement?: number;      // 1st, 2nd, 3rd, etc.
  wins: number;
  losses: number;
}

interface MatchEntry {
  roundIndex: number;
  roundLabel: string;
  opponent: Team | null;        // null for bye
  won: boolean;
  score?: number;
  opponentScore?: number;
  isBye: boolean;
}
```

### TournamentReport
```typescript
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
```

### TournamentStatistics
```typescript
interface TournamentStatistics {
  participantCount: number;
  totalRounds: number;
  byeCount: number;
  averageScore?: number;
  highestScore?: {
    team: Team;
    score: number;
    round: number;
  };
  completionPercentage: number;
}
```

---

## 🛠️ Helper Functions

### generateTournamentWithByes
```typescript
/**
 * Generate tournament structure with byes
 * @param teams - Array of teams (any count >= 2)
 * @param strategy - How to assign byes
 * @returns Tournament data with proper bye structure
 */
function generateTournamentWithByes(
  teams: Team[],
  strategy?: 'top-seeds' | 'random' | 'custom'
): TournamentData
```

**Strategies:**
- `'top-seeds'` - Top-seeded teams get byes (default)
- `'random'` - Random teams get byes
- `'custom'` - Custom logic (use Team.isBye property)

---

## 🎨 CSS Classes

### Existing Classes (Unchanged)
- `.g_gracket` - Main container
- `.g_round` - Round container
- `.g_game` - Game/match container
- `.g_team` - Team container
- `.g_winner` - Winner container
- `.g_spacer` - Spacer element
- `.g_current` - Hover/active state
- `.g_seed` - Seed display
- `.g_score` - Score display
- `.g_score-empty` - Empty score placeholder
- `.g_team-name` - Team name
- `.g_round_label` - Round label
- `.g_canvas` - Canvas element

### New Classes
- `.g_bye` - Bye placeholder (default: `byeClass` option)

**Example styling:**
```css
.g_bye {
  background: #f0f0f0;
  color: #999;
  font-style: italic;
  border: 2px dashed #ccc;
}
```

---

## 🔗 Callbacks & Events

### onScoreUpdate
```typescript
onScoreUpdate?: (
  roundIndex: number,
  gameIndex: number,
  teamIndex: number,
  score: number
) => void
```
**Fires when:** A score is updated via `updateScore()`

**Use for:** Real-time UI updates, validation, saving to DB

### onRoundComplete
```typescript
onRoundComplete?: (roundIndex: number) => void
```
**Fires when:** All matches in a round have winners

**Use for:** Notifications, auto-advancing, analytics

### onRoundGenerated
```typescript
onRoundGenerated?: (
  roundIndex: number,
  roundData: Round
) => void
```
**Fires when:** A new round is generated via `advanceRound()` or `autoGenerateTournament()`

**Use for:** UI updates, logging, notifications

---

## 💡 Common Patterns

### Pattern 1: Interactive Score Entry
```typescript
const bracket = new Gracket('#bracket', {
  src: initialData,
  onScoreUpdate: (r, g, t, score) => {
    if (bracket.isRoundComplete(r)) {
      bracket.advanceRound(r, { createRounds: true });
    }
  }
});

// User enters score
bracket.updateScore(0, 0, 0, 100);
```

### Pattern 2: Tournament with Byes
```typescript
const teams = [/* 6 teams */];
const data = generateTournamentWithByes(teams, 'top-seeds');
const bracket = new Gracket('#bracket', { 
  src: data,
  byeLabel: 'BYE' 
});
```

### Pattern 3: Auto-Generation
```typescript
// Start with first round with scores
const bracket = new Gracket('#bracket', { src: firstRoundData });

// Generate all subsequent rounds
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  onRoundGenerated: (idx, data) => {
    console.log(`Round ${idx + 1} ready`);
  }
});
```

### Pattern 4: Real-Time Reporting
```typescript
const bracket = new Gracket('#bracket', {
  src: data,
  onRoundComplete: (r) => {
    const advancing = bracket.getAdvancingTeams(r);
    showNotification(`Round ${r + 1} complete! ${advancing.length} teams advancing.`);
  }
});
```

### Pattern 5: Export Results
```typescript
// JSON for API
const json = bracket.generateReport({ format: 'json' });
fetch('/api/results', { method: 'POST', body: JSON.stringify(json) });

// Text for console/email
const text = bracket.generateReport({ format: 'text' });
console.log(text);

// HTML for display
const html = bracket.generateReport({ format: 'html' });
document.getElementById('report').innerHTML = html;

// Markdown for docs
const md = bracket.generateReport({ format: 'markdown' });
downloadFile('results.md', md);
```

### Pattern 6: Team Tracking
```typescript
// Get specific team's journey
const history = bracket.getTeamHistory('warriors');

console.log(`${history.team.name}: ${history.wins}W-${history.losses}L`);
history.matches.forEach(m => {
  console.log(`${m.roundLabel}: ${m.won ? 'W' : 'L'} vs ${m.opponent?.name || 'BYE'}`);
});
```

---

## ⚠️ Important Notes

### Backward Compatibility
- ✅ All existing code works without changes
- ✅ All existing options and methods unchanged
- ✅ New features are opt-in

### Byes
- Single-team games are now interpreted as byes
- Byes automatically advance to next round
- Visual bye placeholder is created automatically

### Score Management
- Scores must be numbers (not strings)
- `undefined` or missing scores = incomplete match
- Use `updateScore()` for live updating

### Round Advancement
- Requires all games in round to have winners
- Throws error if scores are tied (unless tie-breaker specified)
- `createRounds: true` to auto-create next round structure

### Reporting
- Works with incomplete tournaments (returns partial data)
- All methods return read-only data (won't mutate internal state)
- Format converters handle edge cases gracefully

---

## 🚀 Quick Start Checklist

### For Byes:
- [ ] Define teams (any count)
- [ ] Use `generateTournamentWithByes()` or manual structure
- [ ] Set `byeLabel` option
- [ ] Style `.g_bye` class if needed

### For Auto-Generation:
- [ ] Start with initial round (with or without scores)
- [ ] Set up `onScoreUpdate` callback
- [ ] Use `updateScore()` for score entry
- [ ] Call `advanceRound()` or `autoGenerateTournament()`

### For Reporting:
- [ ] Call `getAdvancingTeams()` for round summaries
- [ ] Call `getTeamHistory()` for team tracking
- [ ] Call `generateReport()` for export
- [ ] Call `getStatistics()` for analytics

---

## 📦 Import Paths

```typescript
// Main class and types
import { Gracket } from 'gracket';
import type { Team, TournamentData, GracketOptions } from 'gracket';

// Helper function
import { generateTournamentWithByes } from 'gracket';

// New types (for TypeScript)
import type {
  AdvanceOptions,
  MatchResult,
  TeamHistory,
  TournamentReport,
  TournamentStatistics
} from 'gracket';

// Styles
import 'gracket/style.css';

// React adapter
import { GracketReact } from 'gracket/react';

// Vue adapter
import { GracketVue } from 'gracket/vue';
```

---

## 🆘 Common Issues

### Issue: "No tournament data provided"
**Solution:** Ensure `src` option is provided with valid `TournamentData`

### Issue: "Cannot advance round - scores incomplete"
**Solution:** Ensure all teams in all games have scores before calling `advanceRound()`

### Issue: "Tied scores"
**Solution:** Specify `tieBreaker` option in `advanceRound()`

### Issue: Byes not showing
**Solution:** Check `showByeGames` option (default: true), verify CSS is loaded

### Issue: Team history returns empty
**Solution:** Ensure team has `id` property for tracking

### Issue: Report format not working
**Solution:** Check `format` option spelling: 'json' | 'text' | 'html' | 'markdown'

---

## 📞 Support

- **Documentation**: [Full Feature Plan](./FEATURE_PLAN.md)
- **Examples**: [Feature Examples](./FEATURE_EXAMPLES.md)
- **Summary**: [Feature Summary](./FEATURE_SUMMARY.md)
- **Issues**: [GitHub Issues](https://github.com/erik5388/jquery.gracket.js/issues)

---

**Version**: 2.1.0+ (with Issues #14 & #15 support)  
**License**: MIT  
**Backward Compatible**: ✅ Yes
