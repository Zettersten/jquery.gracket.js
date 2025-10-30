# Feature Examples & Migration Guide

## Table of Contents
1. [Byes Examples](#byes-examples)
2. [Auto-Generation Examples](#auto-generation-examples)
3. [Reporting Examples](#reporting-examples)
4. [Migration Scenarios](#migration-scenarios)
5. [Real-World Use Cases](#real-world-use-cases)

---

## Byes Examples

### Example 1: Manual Bye Structure (6 Teams)

```typescript
import { Gracket } from 'gracket';
import 'gracket/style.css';

// Define tournament with 6 teams - top 2 seeds get byes
const sixTeamTournament: TournamentData = [
  // Round 1: 4 teams play, 2 get byes
  [
    // Regular matchup
    [
      { name: 'Heat', id: 'heat', seed: 4, score: 105 },
      { name: 'Bucks', id: 'bucks', seed: 5, score: 98 }
    ],
    // Regular matchup
    [
      { name: 'Suns', id: 'suns', seed: 3, score: 110 },
      { name: 'Nuggets', id: 'nuggets', seed: 6, score: 102 }
    ],
    // BYE - single team
    [{ name: 'Warriors', id: 'warriors', seed: 1 }],
    // BYE - single team
    [{ name: 'Lakers', id: 'lakers', seed: 2 }]
  ],
  // Round 2: All 4 teams play
  [
    [
      { name: 'Heat', id: 'heat', seed: 4, score: 112 },
      { name: 'Warriors', id: 'warriors', seed: 1, score: 118 }  // Warriors from bye
    ],
    [
      { name: 'Suns', id: 'suns', seed: 3, score: 108 },
      { name: 'Lakers', id: 'lakers', seed: 2, score: 115 }  // Lakers from bye
    ]
  ],
  // Finals
  [
    [
      { name: 'Warriors', id: 'warriors', seed: 1, score: 120 },
      { name: 'Lakers', id: 'lakers', seed: 2, score: 115 }
    ]
  ],
  // Champion
  [[{ name: 'Warriors', id: 'warriors', seed: 1 }]]
];

const bracket = new Gracket('#bracket', {
  src: sixTeamTournament,
  byeLabel: 'BYE',
  roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Champion']
});
```

### Example 2: Using Helper Function (5 Teams)

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';

// Define 5 teams
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 }
];

// Auto-generate structure with byes (top seeds get byes)
const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

// Result structure:
// Round 1: 2 matches + 3 byes
// [
//   [
//     [{ heat }, { bucks }],     // 4 vs 5
//     [{ warriors }],            // 1 gets bye
//     [{ lakers }],              // 2 gets bye
//     [{ celtics }]              // 3 gets bye
//   ],
//   // Round 2 auto-generated...
// ]

const bracket = new Gracket('#bracket', { 
  src: tournamentData,
  byeLabel: '— BYE —',
  showByeGames: true
});
```

### Example 3: Custom Bye Styling

```typescript
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  byeLabel: 'Automatic Advance',
  byeClass: 'custom-bye',
  showByeGames: true  // Set to false to hide bye games entirely
});
```

```css
/* Custom CSS for byes */
.custom-bye {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-style: italic;
  opacity: 0.7;
  border: 2px dashed #fff;
}
```

### Example 4: 7-Team Tournament

```typescript
const teams = Array.from({ length: 7 }, (_, i) => ({
  name: `Team ${i + 1}`,
  id: `team-${i + 1}`,
  seed: i + 1
}));

// Strategy: top seed gets bye
const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

// Result:
// Round 1: 3 matches (6 teams) + 1 bye (top seed)
// Round 2: 2 matches (4 teams)
// Round 3: 1 match (2 teams)
// Winner: 1 team

const bracket = new Gracket('#bracket', { 
  src: tournamentData,
  roundLabels: ['Round of 8', 'Semifinals', 'Finals', 'Champion']
});
```

---

## Auto-Generation Examples

### Example 1: Basic Round Advancement

```typescript
// Start with only Round 1, with scores
const initialData: TournamentData = [
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 100 },
      { name: 'Team B', id: 'team-b', seed: 8, score: 85 }
    ],
    [
      { name: 'Team C', id: 'team-c', seed: 4, score: 90 },
      { name: 'Team D', id: 'team-d', seed: 5, score: 88 }
    ]
  ]
];

const bracket = new Gracket('#bracket', { src: initialData });

// Check if round is complete
if (bracket.isRoundComplete(0)) {
  // Advance winners to Round 2
  bracket.advanceRound(0, {
    tieBreaker: 'higher-seed',
    createRounds: true  // Creates Round 2 if it doesn't exist
  });
}

// Updated data now includes Round 2:
// [
//   [ /* Round 1 with scores */ ],
//   [
//     [
//       { name: 'Team A', id: 'team-a', seed: 1 },  // Winner from game 1
//       { name: 'Team C', id: 'team-c', seed: 4 }   // Winner from game 2
//     ]
//   ]
// ]
```

### Example 2: Interactive Score Entry

```typescript
const bracket = new Gracket('#bracket', {
  src: initialData,
  
  // Callback when score is updated
  onScoreUpdate: (roundIndex, gameIndex, teamIndex, score) => {
    const game = bracket.getData()[roundIndex][gameIndex];
    const team = game[teamIndex];
    
    console.log(`${team.name} scored ${score} in Round ${roundIndex + 1}, Game ${gameIndex + 1}`);
    
    // Check if both teams have scored
    const allScored = game.every(t => t.score !== undefined);
    
    if (allScored) {
      const winner = bracket.getMatchWinner(roundIndex, gameIndex);
      console.log(`Match complete! Winner: ${winner?.name}`);
      
      // Auto-advance if round is complete
      if (bracket.isRoundComplete(roundIndex)) {
        setTimeout(() => {
          bracket.advanceRound(roundIndex, { 
            createRounds: true,
            tieBreaker: 'higher-seed'
          });
        }, 500); // Small delay for UX
      }
    }
  }
});

// Simulate user entering scores
bracket.updateScore(0, 0, 0, 100);  // Team A: 100
bracket.updateScore(0, 0, 1, 85);   // Team B: 85
// -> onScoreUpdate fires twice, match is complete, advances if round complete
```

### Example 3: Full Auto-Generation

```typescript
// Define complete Round 1 with scores
const firstRoundComplete: TournamentData = [
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 100 },
      { name: 'Team B', id: 'team-b', seed: 8, score: 85 }
    ],
    [
      { name: 'Team C', id: 'team-c', seed: 4, score: 90 },
      { name: 'Team D', id: 'team-d', seed: 5, score: 88 }
    ],
    [
      { name: 'Team E', id: 'team-e', seed: 2, score: 105 },
      { name: 'Team F', id: 'team-f', seed: 7, score: 98 }
    ],
    [
      { name: 'Team G', id: 'team-g', seed: 3, score: 95 },
      { name: 'Team H', id: 'team-h', seed: 6, score: 92 }
    ]
  ]
];

const bracket = new Gracket('#bracket', { src: firstRoundComplete });

// Generate ALL subsequent rounds automatically
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  
  onRoundGenerated: (roundIndex, roundData) => {
    console.log(`Round ${roundIndex + 1} generated with ${roundData.length} games`);
    
    // Show notification to user
    showNotification(`Round ${roundIndex + 1} bracket is ready!`);
  },
  
  stopAtRound: 2  // Optional: stop at semifinals for manual intervention
});

// Result: Complete tournament structure from quarters to champion
```

### Example 4: Custom Tie-Breaking

```typescript
const bracket = new Gracket('#bracket', { src: data });

bracket.advanceRound(0, {
  tieBreaker: 'callback',
  tieBreakerFn: (team1, team2) => {
    // Custom logic: prefer team with lower seed number
    return team1.seed < team2.seed ? team1 : team2;
    
    // Or use external data
    // return getHeadToHeadRecord(team1, team2);
    
    // Or random
    // return Math.random() > 0.5 ? team1 : team2;
  }
});
```

### Example 5: Preserve Scores When Advancing

```typescript
// Advance winners but keep their scores from previous round
bracket.advanceRound(0, {
  preserveScores: true,  // Teams keep their scores
  createRounds: true
});

// Useful for cumulative scoring or tracking performance
```

### Example 6: Get Winner Without Advancing

```typescript
// Check who would win without modifying tournament
const winner = bracket.getMatchWinner(0, 0);

if (winner) {
  console.log(`Winner of Round 1, Game 1: ${winner.name}`);
  
  // Use for UI updates, notifications, etc.
  highlightWinningTeam(winner.id);
} else {
  console.log('Match not complete yet');
}
```

---

## Reporting Examples

### Example 1: Show Advancing Teams

```typescript
const bracket = new Gracket('#bracket', { src: tournamentData });

// Get teams advancing from Round 1
const advancingFromRound1 = bracket.getAdvancingTeams(0);

console.log('Teams advancing to Round 2:');
advancingFromRound1.forEach(team => {
  console.log(`  - ${team.name} (Seed ${team.seed})`);
});

// UI: Display advancing teams
const list = document.getElementById('advancing-teams');
list.innerHTML = advancingFromRound1
  .map(t => `<li>${t.name}</li>`)
  .join('');
```

### Example 2: Team Tournament History

```typescript
// Track a specific team through the tournament
const teamHistory = bracket.getTeamHistory('warriors');

console.log(`${teamHistory.team.name} Tournament Summary`);
console.log(`Record: ${teamHistory.wins}-${teamHistory.losses}`);
console.log(`Final Placement: ${teamHistory.finalPlacement || 'TBD'}`);
console.log('\nMatches:');

teamHistory.matches.forEach((match, idx) => {
  const result = match.won ? '✓ Won' : '✗ Lost';
  const opponent = match.isBye ? 'BYE' : match.opponent?.name;
  const score = match.score && match.opponentScore 
    ? `(${match.score}-${match.opponentScore})`
    : '';
  
  console.log(`  ${idx + 1}. ${match.roundLabel}: ${result} vs ${opponent} ${score}`);
});

// Output:
// Warriors Tournament Summary
// Record: 4-0
// Final Placement: 1
//
// Matches:
//   1. Round 1: ✓ Won vs BYE
//   2. Quarter Finals: ✓ Won vs Heat (112-98)
//   3. Semi Finals: ✓ Won vs Lakers (118-105)
//   4. Finals: ✓ Won vs Celtics (120-115)
```

### Example 3: Round Results Report

```typescript
// Get detailed results for a specific round
const round1Results = bracket.getRoundResults(0);

console.log('Round 1 Results:');
round1Results.forEach((result, idx) => {
  if (result.isBye) {
    console.log(`  Match ${idx + 1}: ${result.winner.name} (BYE)`);
  } else {
    console.log(
      `  Match ${idx + 1}: ${result.winner.name} (${result.winnerScore}) ` +
      `defeated ${result.loser.name} (${result.loserScore})`
    );
  }
});

// Output:
// Round 1 Results:
//   Match 1: Team A (100) defeated Team B (85)
//   Match 2: Team C (90) defeated Team D (88)
//   Match 3: Team E (BYE)
//   Match 4: Team F (BYE)
```

### Example 4: Text Report Generation

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
// Tournament Statistics:
// - Total Participants: 8
// - Total Rounds: 4
// - Total Matches: 7
// - Completed: 7/7 (100%)
// - Byes: 2
// - Average Score: 98.5
// 
// ROUND 1 (Quarter Finals)
// ✓ Match 1: Warriors (105) def. Thunder (92)
// ✓ Match 2: Lakers (110) def. Rockets (98)
// ✓ Match 3: Celtics (BYE)
// ✓ Match 4: Heat (BYE)
// 
// Advancing: Warriors, Lakers, Celtics, Heat
// 
// ROUND 2 (Semi Finals)
// ✓ Match 1: Warriors (118) def. Heat (105)
// ✓ Match 2: Lakers (112) def. Celtics (108)
// 
// Advancing: Warriors, Lakers
// 
// ROUND 3 (Finals)
// ✓ Match 1: Warriors (120) def. Lakers (115)
// 
// Advancing: Warriors
// 
// CHAMPION: Warriors (Seed 1)
// =================================
```

### Example 5: JSON Report for API

```typescript
const jsonReport = bracket.generateReport({ 
  format: 'json',
  includeStatistics: true 
});

// Send to backend
fetch('/api/tournaments/123/results', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(jsonReport)
});

// JSON structure:
// {
//   "totalRounds": 4,
//   "totalMatches": 7,
//   "completedMatches": 7,
//   "remainingMatches": 0,
//   "currentRound": 4,
//   "champion": { "name": "Warriors", "id": "warriors", "seed": 1 },
//   "finalists": [
//     { "name": "Warriors", "id": "warriors", "seed": 1 },
//     { "name": "Lakers", "id": "lakers", "seed": 2 }
//   ],
//   "allResults": [ /* detailed round data */ ],
//   "statistics": {
//     "participantCount": 8,
//     "byeCount": 2,
//     "averageScore": 98.5,
//     "highestScore": { "team": {...}, "score": 120, "round": 3 }
//   }
// }
```

### Example 6: HTML Report Embedding

```typescript
const htmlReport = bracket.generateReport({
  format: 'html',
  includeScores: true
});

// Embed in page
document.getElementById('tournament-results').innerHTML = htmlReport;

// Result: Formatted HTML table with styling
// <div class="tournament-report">
//   <h2>Tournament Report</h2>
//   <table>...</table>
//   <div class="champion">Champion: Warriors</div>
// </div>
```

### Example 7: Markdown Report for Documentation

```typescript
const mdReport = bracket.generateReport({
  format: 'markdown',
  includeScores: true
});

// Save to file or display
downloadFile('tournament-results.md', mdReport);

// Result: Markdown formatted report
// # Tournament Report
// 
// ## Statistics
// - Participants: 8
// - Rounds: 4
// - Completion: 100%
// 
// ## Round 1
// | Match | Winner | Score | Loser | Score |
// |-------|--------|-------|-------|-------|
// | 1     | Warriors | 105 | Thunder | 92 |
// | 2     | Lakers | 110 | Rockets | 98 |
// ...
```

### Example 8: Tournament Statistics

```typescript
const stats = bracket.getStatistics();

console.log('Tournament Statistics:');
console.log(`  Participants: ${stats.participantCount}`);
console.log(`  Total Rounds: ${stats.totalRounds}`);
console.log(`  Byes: ${stats.byeCount}`);
console.log(`  Average Score: ${stats.averageScore?.toFixed(1)}`);
console.log(`  Completion: ${stats.completionPercentage}%`);

if (stats.highestScore) {
  console.log(
    `  Highest Score: ${stats.highestScore.team.name} ` +
    `scored ${stats.highestScore.score} in round ${stats.highestScore.round + 1}`
  );
}

// Use in dashboard
updateDashboard({
  participants: stats.participantCount,
  completion: stats.completionPercentage,
  avgScore: stats.averageScore
});
```

---

## Migration Scenarios

### Scenario 1: Existing Tournament → Add Byes

**Before (8 teams):**
```typescript
const bracket = new Gracket('#bracket', {
  src: eightTeamData,
  roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals', 'Champion']
});
```

**After (6 teams with byes):**
```typescript
// Option A: Manual structure
const sixTeamData = [
  [
    [{ name: 'Team 4', seed: 4, score: 90 }, { name: 'Team 5', seed: 5, score: 88 }],
    [{ name: 'Team 3', seed: 3, score: 85 }, { name: 'Team 6', seed: 6, score: 80 }],
    [{ name: 'Team 1', seed: 1 }],  // BYE
    [{ name: 'Team 2', seed: 2 }]   // BYE
  ],
  // ... rest of tournament
];

// Option B: Use helper
const teams = [/* 6 teams */];
const sixTeamData = generateTournamentWithByes(teams, 'top-seeds');

const bracket = new Gracket('#bracket', {
  src: sixTeamData,
  byeLabel: 'BYE',
  roundLabels: ['Round 1', 'Semi Finals', 'Finals', 'Champion']
});
```

### Scenario 2: Static Data → Interactive Scoring

**Before (static data):**
```typescript
// Had to manually create all rounds with scores
const data = [
  [ /* Round 1 with scores */ ],
  [ /* Round 2 with scores */ ],
  [ /* Finals with scores */ ],
  [ /* Champion */ ]
];

const bracket = new Gracket('#bracket', { src: data });
```

**After (interactive):**
```typescript
// Start with just Round 1
const initialData = [
  [ /* Round 1 matchups, no scores */ ]
];

const bracket = new Gracket('#bracket', {
  src: initialData,
  
  onScoreUpdate: (roundIdx, gameIdx, teamIdx, score) => {
    // Handle score entry
    if (bracket.isRoundComplete(roundIdx)) {
      bracket.advanceRound(roundIdx, { createRounds: true });
    }
  }
});

// User enters scores via UI
function handleScoreInput(roundIdx, gameIdx, teamIdx, score) {
  bracket.updateScore(roundIdx, gameIdx, teamIdx, score);
}
```

### Scenario 3: Add Reporting to Existing Bracket

**Before (no reporting):**
```typescript
const bracket = new Gracket('#bracket', { src: data });
// Tournament runs, but no way to query results
```

**After (with reporting):**
```typescript
const bracket = new Gracket('#bracket', { src: data });

// Add "Show Results" button
document.getElementById('show-results').addEventListener('click', () => {
  const report = bracket.generateReport({
    format: 'text',
    includeScores: true,
    includeStatistics: true
  });
  
  alert(report);
  // Or display in modal, download, etc.
});

// Add "Team History" feature
document.querySelectorAll('.team').forEach(teamEl => {
  teamEl.addEventListener('click', (e) => {
    const teamId = teamEl.dataset.teamId;
    const history = bracket.getTeamHistory(teamId);
    
    showTeamHistoryModal(history);
  });
});
```

---

## Real-World Use Cases

### Use Case 1: Live Sports Tournament

```typescript
// Initial setup
const teams = fetchTeamsFromAPI();
const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

const bracket = new Gracket('#bracket', {
  src: tournamentData,
  roundLabels: ['Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals', 'Champion'],
  
  onScoreUpdate: async (roundIdx, gameIdx, teamIdx, score) => {
    // Save to database
    await fetch('/api/scores', {
      method: 'POST',
      body: JSON.stringify({ roundIdx, gameIdx, teamIdx, score })
    });
    
    // Check for round completion
    if (bracket.isRoundComplete(roundIdx)) {
      // Advance and notify
      bracket.advanceRound(roundIdx, { 
        createRounds: true,
        tieBreaker: 'higher-seed'
      });
      
      // Send notifications
      const advancing = bracket.getAdvancingTeams(roundIdx);
      notifyUsers(`Round ${roundIdx + 1} complete! ${advancing.length} teams advancing.`);
    }
  },
  
  onRoundComplete: async (roundIdx) => {
    // Generate and store report
    const report = bracket.generateReport({ format: 'json' });
    await fetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  }
});

// Real-time score updates from admin panel
socket.on('score-update', (data) => {
  bracket.updateScore(data.round, data.game, data.team, data.score);
});
```

### Use Case 2: Gaming Tournament Platform

```typescript
// Tournament creation
function createTournament(players: Player[]) {
  const teams = players.map((p, idx) => ({
    name: p.username,
    id: p.id,
    seed: idx + 1
  }));
  
  const tournamentData = generateTournamentWithByes(teams, 'random');
  
  const bracket = new Gracket('#bracket', {
    src: tournamentData,
    byeLabel: 'AUTO WIN',
    
    onScoreUpdate: (roundIdx, gameIdx, teamIdx, score) => {
      // Update player stats in real-time
      updatePlayerStats(teamIdx, score);
    }
  });
  
  return bracket;
}

// Match reporting by players
function submitMatchResult(roundIdx: number, gameIdx: number, scores: [number, number]) {
  bracket.updateScore(roundIdx, gameIdx, 0, scores[0]);
  bracket.updateScore(roundIdx, gameIdx, 1, scores[1]);
  
  if (bracket.isRoundComplete(roundIdx)) {
    const advancing = bracket.getAdvancingTeams(roundIdx);
    
    // Notify advancing players
    advancing.forEach(team => {
      sendEmail(team.id, `Congratulations! You've advanced to the next round.`);
    });
    
    // Auto-generate next round
    bracket.advanceRound(roundIdx, { 
      createRounds: true,
      tieBreakerFn: (t1, t2) => getUserRating(t1.id) > getUserRating(t2.id) ? t1 : t2
    });
  }
}

// Tournament summary page
function showTournamentSummary() {
  const report = bracket.generateReport({
    format: 'html',
    includeScores: true,
    includeStatistics: true
  });
  
  document.getElementById('summary').innerHTML = report;
  
  // Add player-specific history
  const currentPlayer = getCurrentPlayer();
  const history = bracket.getTeamHistory(currentPlayer.id);
  
  document.getElementById('your-history').innerHTML = `
    <h3>Your Tournament History</h3>
    <p>Record: ${history.wins}-${history.losses}</p>
    <p>Final Placement: ${history.finalPlacement || 'In Progress'}</p>
    <ul>
      ${history.matches.map(m => `
        <li>${m.roundLabel}: ${m.won ? 'W' : 'L'} vs ${m.opponent?.name || 'BYE'}</li>
      `).join('')}
    </ul>
  `;
}
```

### Use Case 3: March Madness Style Bracket Challenge

```typescript
// Users fill out predictions
function createPredictionBracket() {
  const teams = fetchNCAA Teams();
  const tournamentData = generateTournamentWithByes(teams, 'top-seeds');
  
  const bracket = new Gracket('#bracket', {
    src: tournamentData,
    roundLabels: ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship']
  });
  
  // User clicks winners
  document.querySelectorAll('.team').forEach(teamEl => {
    teamEl.addEventListener('click', () => {
      // Mark as predicted winner
      savePrediction(teamEl.dataset.teamId);
    });
  });
  
  return bracket;
}

// Admin fills in actual results
function updateActualResults() {
  const bracket = new Gracket('#admin-bracket', {
    src: actualTournamentData,
    
    onScoreUpdate: (r, g, t, score) => {
      // Broadcast to all users
      broadcastUpdate({ round: r, game: g, team: t, score });
      
      // Check predictions
      if (bracket.isRoundComplete(r)) {
        const actualWinners = bracket.getAdvancingTeams(r);
        updatePredictionScores(actualWinners);
      }
    }
  });
  
  // Auto-generate leaderboard
  setInterval(() => {
    const report = bracket.generateReport({ format: 'json' });
    updateLeaderboard(report);
  }, 5000);
}

// Compare user predictions vs actual
function showUserAccuracy(userId: string) {
  const actualBracket = getActualBracket();
  const userBracket = getUserBracket(userId);
  
  let correct = 0;
  let total = 0;
  
  for (let r = 0; r < actualBracket.getData().length; r++) {
    const actualWinners = actualBracket.getAdvancingTeams(r);
    const predictedWinners = userBracket.getAdvancingTeams(r);
    
    actualWinners.forEach(winner => {
      total++;
      if (predictedWinners.some(p => p.id === winner.id)) {
        correct++;
      }
    });
  }
  
  return `${correct}/${total} correct (${(correct/total*100).toFixed(1)}%)`;
}
```

### Use Case 4: Corporate Hackathon Tournament

```typescript
// Setup hackathon bracket
const teams = participatingTeams.map((team, idx) => ({
  name: team.name,
  id: team.id,
  seed: team.preliminaryScore // Use prelim score as seed
}));

const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

const bracket = new Gracket('#hackathon-bracket', {
  src: tournamentData,
  byeLabel: 'Auto Advance',
  roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Winner'],
  
  onRoundComplete: (roundIdx) => {
    // Generate round report
    const roundResults = bracket.getRoundResults(roundIdx);
    const advancing = bracket.getAdvancingTeams(roundIdx);
    
    // Email to all participants
    sendRoundSummaryEmail({
      round: roundIdx + 1,
      results: roundResults,
      advancing: advancing
    });
    
    // Post to Slack
    postToSlack(`
      🏆 Round ${roundIdx + 1} Complete! 🏆
      
      Advancing teams:
      ${advancing.map(t => `• ${t.name}`).join('\n')}
      
      View full bracket: https://hackathon.com/bracket
    `);
  }
});

// Judges score entries
function submitJudgeScores(roundIdx: number, gameIdx: number, judgeScores: number[]) {
  // Average judge scores
  const team1Avg = average(judgeScores.slice(0, judgeScores.length / 2));
  const team2Avg = average(judgeScores.slice(judgeScores.length / 2));
  
  bracket.updateScore(roundIdx, gameIdx, 0, team1Avg);
  bracket.updateScore(roundIdx, gameIdx, 1, team2Avg);
  
  // Check if ready to advance
  if (bracket.isRoundComplete(roundIdx)) {
    bracket.advanceRound(roundIdx, { 
      createRounds: true,
      tieBreakerFn: (t1, t2) => {
        // Tie-break: team with better prelim score
        return t1.seed < t2.seed ? t1 : t2;
      }
    });
  }
}

// Final ceremony
function displayFinalResults() {
  const report = bracket.generateReport({
    format: 'html',
    includeScores: true,
    includeStatistics: true
  });
  
  // Show on big screen
  displayOnProjector(report);
  
  // Get winner history for ceremony speech
  const champion = bracket.getData().at(-1)?.[0]?.[0];
  if (champion) {
    const history = bracket.getTeamHistory(champion.id);
    
    console.log(`
      And the winner is... ${champion.name}!
      
      Their path to victory:
      ${history.matches.map(m => 
        `${m.roundLabel}: Defeated ${m.opponent?.name || 'BYE'} (${m.score}-${m.opponentScore})`
      ).join('\n')}
    `);
  }
}
```

---

## Summary

These examples demonstrate:

1. **Byes**: Flexible support for any team count, automatic structure generation
2. **Auto-Generation**: Interactive score entry, automatic bracket advancement
3. **Reporting**: Comprehensive querying and reporting in multiple formats
4. **Real-World Usage**: Practical implementations for various scenarios

All features maintain backward compatibility while providing powerful new capabilities for modern tournament management.
