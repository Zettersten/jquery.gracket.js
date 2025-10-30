# Quick Start: New Features (Issues #14 & #15)

## 🚀 Try the New Features in 5 Minutes

### 1. Byes Support (Issue #15)

#### Basic Example: 6-Team Tournament
```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';
import 'gracket/style.css';

// Define 6 teams (not a power of 2!)
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 },
  { name: 'Suns', id: 'suns', seed: 6 },
];

// Generate tournament with byes (top 2 seeds get byes)
const data = generateTournamentWithByes(teams, 'top-seeds');

// Create bracket
const bracket = new Gracket('#bracket', {
  src: data,
  byeLabel: 'BYE',  // Customize bye label
});
```

**Result**: Warriors and Lakers get byes in round 1!

---

### 2. Auto-Generation (Issue #14a)

#### Interactive Score Entry
```typescript
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  
  // Callback when score is updated
  onScoreUpdate: (roundIdx, gameIdx, teamIdx, score) => {
    console.log(`Score entered: ${score}`);
    
    // Auto-advance when round is complete
    if (bracket.isRoundComplete(roundIdx)) {
      bracket.advanceRound(roundIdx, {
        tieBreaker: 'higher-seed',
        createRounds: true
      });
    }
  }
});

// User enters scores
bracket.updateScore(0, 0, 0, 100);  // Round 0, Game 0, Team 0: 100
bracket.updateScore(0, 0, 1, 85);   // Round 0, Game 0, Team 1: 85
// → Automatically advances to next round!
```

#### Full Auto-Generation
```typescript
// Define ONLY first round with scores
const firstRound = [
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

const bracket = new Gracket('#bracket', { src: firstRound });

// Generate ALL subsequent rounds automatically
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  onRoundGenerated: (idx, data) => {
    console.log(`Round ${idx + 1} ready!`);
  }
});

// Result: Complete tournament from quarters to champion!
```

---

### 3. Reporting (Issue #14b)

#### Get Advancing Teams
```typescript
// See who's moving on
const advancing = bracket.getAdvancingTeams(0);
console.log('Advancing to Round 2:');
advancing.forEach(team => {
  console.log(`  - ${team.name} (Seed ${team.seed})`);
});
```

#### Track a Team
```typescript
// Follow a team through the tournament
const history = bracket.getTeamHistory('warriors');

console.log(`${history.team.name}`);
console.log(`Record: ${history.wins}W - ${history.losses}L`);
console.log(`Placement: ${history.finalPlacement || 'In Progress'}`);
console.log('\nMatches:');

history.matches.forEach((match, i) => {
  const result = match.won ? '✓ Won' : '✗ Lost';
  const vs = match.isBye ? 'BYE' : match.opponent?.name;
  const score = match.score && match.opponentScore 
    ? `(${match.score}-${match.opponentScore})` 
    : '';
  
  console.log(`  ${i + 1}. ${match.roundLabel}: ${result} vs ${vs} ${score}`);
});

// Output:
// Warriors
// Record: 3W - 0L
// Placement: 1
// 
// Matches:
//   1. Round 1: ✓ Won vs BYE
//   2. Semifinals: ✓ Won vs Lakers (112-105)
//   3. Finals: ✓ Won vs Celtics (120-115)
```

#### Generate Report
```typescript
// Get text report
const textReport = bracket.generateReport({
  format: 'text',
  includeScores: true,
  includeStatistics: true
});
console.log(textReport);

// Get JSON for API
const jsonReport = bracket.generateReport({ format: 'json' });
fetch('/api/tournament', {
  method: 'POST',
  body: JSON.stringify(jsonReport)
});

// Get HTML for display
const htmlReport = bracket.generateReport({ format: 'html' });
document.getElementById('results').innerHTML = htmlReport;

// Get statistics
const stats = bracket.getStatistics();
console.log(`Completion: ${stats.completionPercentage}%`);
console.log(`Average Score: ${stats.averageScore?.toFixed(1)}`);
```

---

## 🎯 Complete Workflow Example

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';
import 'gracket/style.css';

// 1. Create 6-team tournament with byes
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 },
  { name: 'Suns', id: 'suns', seed: 6 },
];

const data = generateTournamentWithByes(teams, 'top-seeds');

// 2. Initialize with event callbacks
const bracket = new Gracket('#bracket', {
  src: data,
  byeLabel: 'BYE',
  roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Champion'],
  
  onScoreUpdate: (r, g, t, score) => {
    console.log(`Score: ${score}`);
  },
  
  onRoundComplete: (r) => {
    const advancing = bracket.getAdvancingTeams(r);
    console.log(`Round ${r + 1} complete!`);
    console.log('Advancing:', advancing.map(t => t.name).join(', '));
  }
});

// 3. Enter scores (or load from your backend)
bracket.updateScore(0, 0, 0, 105);  // Heat vs Bucks
bracket.updateScore(0, 0, 1, 98);
bracket.updateScore(0, 1, 0, 110);  // Suns vs ...
bracket.updateScore(0, 1, 1, 102);

// 4. Advance to next round
if (bracket.isRoundComplete(0)) {
  bracket.advanceRound(0, {
    tieBreaker: 'higher-seed',
    createRounds: true
  });
}

// 5. Get tournament state
const advancing = bracket.getAdvancingTeams(0);
console.log('Moving on:', advancing);

// 6. Track a team
const warriorsPath = bracket.getTeamHistory('warriors');
console.log(`Warriors: ${warriorsPath.wins}W-${warriorsPath.losses}L`);

// 7. Generate report
const report = bracket.generateReport({
  format: 'text',
  includeScores: true,
  includeStatistics: true
});
console.log(report);

// 8. Get statistics
const stats = bracket.getStatistics();
console.log(`Tournament is ${stats.completionPercentage}% complete`);
console.log(`${stats.byeCount} byes in this tournament`);
```

---

## 📝 Key Points

### Byes
- Use `generateTournamentWithByes(teams, 'top-seeds')` for automatic bye generation
- Or manually create single-team games: `[{ name: 'Team A', seed: 1 }]`
- Customize with `byeLabel` and `byeClass` options

### Auto-Generation
- Use `updateScore()` for interactive scoring
- Use `advanceRound()` to progress one round
- Use `autoGenerateTournament()` to generate entire bracket
- Set up callbacks with `onScoreUpdate`, `onRoundComplete`, `onRoundGenerated`

### Reporting
- Use `getAdvancingTeams()` to see who's moving on
- Use `getTeamHistory()` to track a team's path
- Use `generateReport()` to export in multiple formats
- Use `getStatistics()` for tournament metrics

---

## 🎨 Customization

### Customize Bye Display
```typescript
const bracket = new Gracket('#bracket', {
  src: data,
  byeLabel: 'AUTO WIN',           // Custom label
  byeClass: 'custom-bye',         // Custom CSS class
  showByeGames: true              // Show/hide byes
});
```

```css
/* Custom bye styling */
.custom-bye {
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 100%);
  border-left: 4px dashed #999 !important;
  opacity: 0.7;
}
```

### Tie-Breaking Strategies
```typescript
// Strategy 1: Higher seed wins
bracket.advanceRound(0, { tieBreaker: 'higher-seed' });

// Strategy 2: Lower seed wins
bracket.advanceRound(0, { tieBreaker: 'lower-seed' });

// Strategy 3: Custom function
bracket.advanceRound(0, {
  tieBreaker: 'callback',
  tieBreakerFn: (team1, team2) => {
    // Your custom logic
    return team1.seed < team2.seed ? team1 : team2;
  }
});

// Strategy 4: Throw error (default)
bracket.advanceRound(0, { tieBreaker: 'error' });
```

---

## 🔗 More Information

- **Complete Documentation**: See `FEATURES_README.md`
- **Detailed Examples**: See `FEATURE_EXAMPLES.md`
- **API Reference**: See `API_QUICK_REFERENCE.md`
- **Technical Details**: See `FEATURE_PLAN.md`

---

## ✨ That's It!

You now have:
- ✅ Byes support for any team count
- ✅ Interactive scoring with auto-advancement
- ✅ Comprehensive reporting in multiple formats
- ✅ Full backward compatibility

Start building amazing tournament brackets! 🏆
