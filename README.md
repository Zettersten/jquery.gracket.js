# 🏆 Gracket

> **The most powerful, modern tournament bracket library for JavaScript**  
> Built with TypeScript • Zero Dependencies • Framework Agnostic • Fully Featured

[![npm version](https://img.shields.io/npm/v/gracket.svg)](https://www.npmjs.com/package/gracket)
[![Build Status](https://github.com/erik5388/jquery.gracket.js/workflows/CI/badge.svg)](https://github.com/erik5388/jquery.gracket.js/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Gracket** is a comprehensive tournament bracket library that handles everything from simple 8-team brackets to complex tournaments with byes, automatic round generation, score tracking, and detailed reporting. Works seamlessly with React, Vue, Angular, or vanilla JavaScript.

---

## ✨ Features

### Core Features
- 🎨 **Modern & Beautiful** - ESPN-inspired design with smooth animations
- ⚡ **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS
- 📦 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🎯 **Zero Dependencies** - No jQuery required - pure modern JavaScript
- 🚀 **Tree Shakable** - ES modules with optimal bundle size (~8.5 KB gzipped)
- 📱 **Responsive** - Works perfectly on all screen sizes
- ♿ **Accessible** - Built with accessibility in mind

### NEW in v2.1: Advanced Tournament Management
- 🎲 **Byes Support** - Handle any number of teams, not just powers of 2
- 🔄 **Auto-Generation** - Automatically generate brackets based on match results
- 📊 **Comprehensive Reporting** - Track teams, generate reports, export data
- 📈 **Real-Time Scoring** - Interactive score entry with automatic advancement
- 🎯 **Event System** - React to score updates, round completions, and more
- 📉 **Statistics** - Calculate completion rates, averages, and tournament metrics
- 💾 **Multiple Export Formats** - JSON, Plain Text, HTML, and Markdown

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Features](#-core-features)
  - [Basic Tournament Bracket](#basic-tournament-bracket)
  - [Byes Support (NEW)](#byes-support-new)
  - [Auto-Generation (NEW)](#auto-generation-new)
  - [Reporting & Statistics (NEW)](#reporting--statistics-new)
- [Framework Integration](#-framework-integration)
- [Complete API Reference](#-complete-api-reference)
- [Advanced Examples](#-advanced-examples)
- [Styling & Customization](#-styling--customization)
- [TypeScript Support](#-typescript-support)
- [Migration Guide](#-migration-guide)

---

## 🚀 Installation

```bash
npm install gracket
# or
yarn add gracket
# or
pnpm add gracket
```

---

## 🎯 Quick Start

### Simplest Example

```typescript
import { Gracket } from 'gracket';
import 'gracket/style.css';

const bracket = new Gracket('#bracket', {
  src: [
    [
      [{ name: 'Team A', seed: 1, score: 100 }, { name: 'Team B', seed: 2, score: 85 }]
    ],
    [[{ name: 'Team A', seed: 1 }]]
  ]
});
```

### Feature-Rich Example

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';
import 'gracket/style.css';

// Generate tournament for 6 teams (with automatic byes)
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 },
  { name: 'Suns', id: 'suns', seed: 6 }
];

const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

// Create interactive bracket
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  byeLabel: 'BYE',
  roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Champion'],
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  
  // Real-time callbacks
  onScoreUpdate: (round, game, team, score) => {
    console.log(`Score entered: ${score}`);
  },
  
  onRoundComplete: (round) => {
    const advancing = bracket.getAdvancingTeams(round);
    console.log('Teams advancing:', advancing.map(t => t.name));
  }
});

// Interactive scoring
bracket.updateScore(0, 0, 0, 105); // Round 0, Game 0, Team 0: 105
bracket.updateScore(0, 0, 1, 98);  // Round 0, Game 0, Team 1: 98

// Auto-advance when round completes
if (bracket.isRoundComplete(0)) {
  bracket.advanceRound(0, {
    tieBreaker: 'higher-seed',
    createRounds: true
  });
}

// Generate comprehensive report
const report = bracket.generateReport({
  format: 'text',
  includeScores: true,
  includeStatistics: true
});
console.log(report);

// Track specific team
const warriorsHistory = bracket.getTeamHistory('warriors');
console.log(`${warriorsHistory.team.name}: ${warriorsHistory.wins}W-${warriorsHistory.losses}L`);
```

---

## 🎨 Core Features

### Basic Tournament Bracket

The foundation - display beautiful tournament brackets with any structure.

```typescript
import { Gracket } from 'gracket';
import 'gracket/style.css';

const tournamentData = [
  // Round 1 - Quarterfinals
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
      { name: 'Team F', id: 'team-f', seed: 7, score: 95 }
    ],
    [
      { name: 'Team G', id: 'team-g', seed: 3, score: 92 },
      { name: 'Team H', id: 'team-h', seed: 6, score: 88 }
    ]
  ],
  // Round 2 - Semifinals
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 95 },
      { name: 'Team C', id: 'team-c', seed: 4, score: 92 }
    ],
    [
      { name: 'Team E', id: 'team-e', seed: 2, score: 98 },
      { name: 'Team G', id: 'team-g', seed: 3, score: 96 }
    ]
  ],
  // Round 3 - Finals
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 102 },
      { name: 'Team E', id: 'team-e', seed: 2, score: 99 }
    ]
  ],
  // Champion
  [
    [{ name: 'Team A', id: 'team-a', seed: 1 }]
  ]
];

const bracket = new Gracket('#bracket', {
  src: tournamentData,
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  canvasLineWidth: 2,
  roundLabels: ['Quarterfinals', 'Semifinals', 'Finals', 'Champion']
});

// Update bracket with new data
bracket.update(newTournamentData);

// Get current data
const currentData = bracket.getData();

// Clean up
bracket.destroy();
```

**Interactive Features:**
- Hover over any team to highlight all their appearances
- Smooth animations and transitions
- Responsive canvas-drawn connector lines
- ESPN-inspired modern styling

---

### Byes Support (NEW!)

Handle tournaments with any number of teams - not just powers of 2!

#### What are Byes?

In real-world tournaments, you often have participant counts that aren't perfect powers of 2 (like 5, 6, 7, 9, 10 teams). **Byes** are automatic advancements where top-seeded teams skip the first round.

#### Automatic Bye Generation

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';

// Tournament with 6 teams (normally would need 8)
const teams = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 },
  { name: 'Celtics', id: 'celtics', seed: 3 },
  { name: 'Heat', id: 'heat', seed: 4 },
  { name: 'Bucks', id: 'bucks', seed: 5 },
  { name: 'Suns', id: 'suns', seed: 6 }
];

// Generate tournament structure with byes
// Top 2 seeds (Warriors, Lakers) will get byes
const tournamentData = generateTournamentWithByes(teams, 'top-seeds');

const bracket = new Gracket('#bracket', {
  src: tournamentData,
  byeLabel: 'BYE',           // Label for bye placeholder
  byeClass: 'g_bye',         // CSS class for styling
  showByeGames: true         // Show/hide bye visualizations
});
```

**Result:**
```
Round 1                Round 2
┌──────────────┐
│ Heat      105│────┐
│ Bucks      98│    │      ┌──────────────┐
└──────────────┘    ├──────┤ Heat      112│
                    │      │ Warriors  118│
┌──────────────┐    │      └──────────────┘
│ Suns      110│────┘
│ (6 seed)  102│
└──────────────┘

┌──────────────┐
│ Warriors     │────┐  (BYE - automatically advances)
│ BYE          │    │
└──────────────┘    │

┌──────────────┐    │
│ Lakers       │────┘  (BYE - automatically advances)
│ BYE          │
└──────────────┘
```

#### Manual Bye Structure

You can also manually create byes by using single-team games:

```typescript
const tournamentData = [
  [
    // Regular matchup
    [
      { name: 'Heat', seed: 4, score: 105 },
      { name: 'Bucks', seed: 5, score: 98 }
    ],
    // BYE - single team automatically advances
    [{ name: 'Warriors', seed: 1 }],
    [{ name: 'Lakers', seed: 2 }]
  ],
  // Next round...
];
```

#### Bye Customization

```typescript
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  byeLabel: 'AUTO WIN',           // Custom label
  byeClass: 'custom-bye',         // Custom CSS class
  showByeGames: false             // Hide bye placeholders entirely
});
```

```css
/* Custom bye styling */
.custom-bye {
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px dashed #6c757d !important;
  opacity: 0.5;
  font-style: italic;
}
```

#### Bye Seeding Strategies

```typescript
// Strategy 1: Top seeds get byes (default)
generateTournamentWithByes(teams, 'top-seeds');

// Strategy 2: Random byes
generateTournamentWithByes(teams, 'random');

// Strategy 3: Custom (manual structure)
// Just create your own tournament structure with single-team games
```

---

### Auto-Generation (NEW!)

Automatically generate tournament brackets based on match results. Perfect for live tournaments!

#### Interactive Score Entry

```typescript
const bracket = new Gracket('#bracket', {
  src: initialData,
  
  // Callback fired when score is entered
  onScoreUpdate: (roundIndex, gameIndex, teamIndex, score) => {
    console.log(`Score updated: Round ${roundIndex + 1}, Game ${gameIndex + 1}, Team ${teamIndex}, Score: ${score}`);
    
    // Auto-advance when round completes
    if (bracket.isRoundComplete(roundIndex)) {
      bracket.advanceRound(roundIndex, {
        tieBreaker: 'higher-seed',
        createRounds: true
      });
    }
  },
  
  // Callback fired when round is complete
  onRoundComplete: (roundIndex) => {
    const advancing = bracket.getAdvancingTeams(roundIndex);
    console.log(`Round ${roundIndex + 1} complete!`);
    console.log('Advancing teams:', advancing.map(t => t.name).join(', '));
  },
  
  // Callback fired when new round is generated
  onRoundGenerated: (roundIndex, roundData) => {
    console.log(`Round ${roundIndex + 1} generated with ${roundData.length} games`);
  }
});

// Update scores (e.g., from user input or live feed)
bracket.updateScore(0, 0, 0, 100);  // Round 0, Game 0, Team 0: 100 points
bracket.updateScore(0, 0, 1, 85);   // Round 0, Game 0, Team 1: 85 points

// Check if match has winner
const winner = bracket.getMatchWinner(0, 0);
if (winner) {
  console.log(`Winner: ${winner.name}`);
}

// Check if entire round is complete
if (bracket.isRoundComplete(0)) {
  console.log('Round 0 is complete! Ready to advance.');
}
```

#### Manual Round Advancement

```typescript
// Advance one round at a time
bracket.advanceRound(0, {
  tieBreaker: 'higher-seed',     // How to handle tied scores
  tieBreakerFn: undefined,        // Custom tie-breaker function
  preserveScores: false,          // Keep scores when advancing
  createRounds: true              // Create next round if missing
});
```

#### Tie-Breaking Strategies

```typescript
// Strategy 1: Throw error on ties (default)
bracket.advanceRound(0, { tieBreaker: 'error' });

// Strategy 2: Higher seed wins
bracket.advanceRound(0, { tieBreaker: 'higher-seed' });

// Strategy 3: Lower seed wins (upset preference)
bracket.advanceRound(0, { tieBreaker: 'lower-seed' });

// Strategy 4: Custom function
bracket.advanceRound(0, {
  tieBreaker: 'callback',
  tieBreakerFn: (team1, team2) => {
    // Your custom logic
    // Example: Use head-to-head record
    return getHeadToHeadWinner(team1, team2);
    
    // Example: Random
    return Math.random() > 0.5 ? team1 : team2;
    
    // Example: Prefer lower seed (upset)
    return team1.seed > team2.seed ? team1 : team2;
  }
});
```

#### Full Auto-Generation

Generate the entire tournament from just the first round's results:

```typescript
// Define ONLY first round with scores
const firstRoundData = [
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team B', seed: 8, score: 85 }
    ],
    [
      { name: 'Team C', seed: 4, score: 90 },
      { name: 'Team D', seed: 5, score: 88 }
    ],
    [
      { name: 'Team E', seed: 2, score: 105 },
      { name: 'Team F', seed: 7, score: 95 }
    ],
    [
      { name: 'Team G', seed: 3, score: 92 },
      { name: 'Team H', seed: 6, score: 88 }
    ]
  ]
];

const bracket = new Gracket('#bracket', { src: firstRoundData });

// Auto-generate ALL subsequent rounds
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  
  onRoundGenerated: (roundIndex, roundData) => {
    console.log(`Round ${roundIndex + 1}:`, roundData);
  },
  
  stopAtRound: 2  // Optional: stop at specific round
});

// Result: Complete tournament structure from quarters to champion!
```

#### Real-World Example: Live Tournament

```typescript
// Tournament management system
class LiveTournament {
  bracket: Gracket;
  
  constructor(teams: Team[]) {
    const data = generateTournamentWithByes(teams, 'top-seeds');
    
    this.bracket = new Gracket('#bracket', {
      src: data,
      roundLabels: ['Round of 16', 'Quarterfinals', 'Semifinals', 'Finals', 'Champion'],
      
      onScoreUpdate: (r, g, t, score) => {
        // Save to database
        this.saveScore(r, g, t, score);
        
        // Broadcast to spectators
        this.broadcastUpdate({ round: r, game: g, team: t, score });
      },
      
      onRoundComplete: (r) => {
        // Notify all participants
        const advancing = this.bracket.getAdvancingTeams(r);
        this.notifyAdvancingTeams(advancing);
        
        // Generate next round
        this.bracket.advanceRound(r, { 
          tieBreaker: 'higher-seed',
          createRounds: true 
        });
      }
    });
  }
  
  // Admin enters score from match
  recordMatchScore(round: number, game: number, team: number, score: number) {
    this.bracket.updateScore(round, game, team, score);
  }
  
  // Get current tournament state
  getStatus() {
    return {
      data: this.bracket.getData(),
      stats: this.bracket.getStatistics(),
      report: this.bracket.generateReport({ format: 'json' })
    };
  }
}
```

---

### Reporting & Statistics (NEW!)

Comprehensive tournament reporting, team tracking, and statistics.

#### Get Advancing Teams

```typescript
// Get teams advancing from specific round
const advancingFromRound1 = bracket.getAdvancingTeams(0);

console.log('Teams advancing to Round 2:');
advancingFromRound1.forEach(team => {
  console.log(`  - ${team.name} (Seed ${team.seed})`);
});

// Get advancing from latest completed round
const latestAdvancing = bracket.getAdvancingTeams();  // No argument = latest
```

#### Get Round Results

```typescript
// Get detailed results for a round
const roundResults = bracket.getRoundResults(0);

roundResults.forEach((result, idx) => {
  if (result.isBye) {
    console.log(`Match ${idx + 1}: ${result.winner.name} (BYE)`);
  } else {
    console.log(
      `Match ${idx + 1}: ${result.winner.name} (${result.winnerScore}) ` +
      `defeated ${result.loser?.name} (${result.loserScore})`
    );
  }
});

// Output:
// Match 1: Team A (100) defeated Team B (85)
// Match 2: Team C (90) defeated Team D (88)
// Match 3: Team E (BYE)
```

#### Track Team History

Follow a specific team through the entire tournament:

```typescript
const teamHistory = bracket.getTeamHistory('warriors');

console.log(`=== ${teamHistory.team.name} Tournament History ===`);
console.log(`Final Record: ${teamHistory.wins}W - ${teamHistory.losses}L`);
console.log(`Final Placement: ${teamHistory.finalPlacement || 'In Progress'}`);
console.log('\nMatch-by-Match:');

teamHistory.matches.forEach((match, index) => {
  const result = match.won ? '✓ WIN' : '✗ LOSS';
  const opponent = match.isBye ? 'BYE' : match.opponent?.name;
  const scoreDetail = match.score && match.opponentScore
    ? ` (${match.score}-${match.opponentScore})`
    : '';
  
  console.log(
    `  ${index + 1}. ${match.roundLabel}: ${result} vs ${opponent}${scoreDetail}`
  );
});

// Output:
// === Warriors Tournament History ===
// Final Record: 4W - 0L
// Final Placement: 1
// 
// Match-by-Match:
//   1. Round 1: ✓ WIN vs BYE
//   2. Quarterfinals: ✓ WIN vs Thunder (112-98)
//   3. Semifinals: ✓ WIN vs Lakers (118-105)
//   4. Finals: ✓ WIN vs Celtics (120-115)
```

#### Get Tournament Statistics

```typescript
const stats = bracket.getStatistics();

console.log('Tournament Statistics:');
console.log(`  Participants: ${stats.participantCount}`);
console.log(`  Total Rounds: ${stats.totalRounds}`);
console.log(`  Byes: ${stats.byeCount}`);
console.log(`  Average Score: ${stats.averageScore?.toFixed(1) || 'N/A'}`);
console.log(`  Completion: ${stats.completionPercentage}%`);

if (stats.highestScore) {
  console.log(
    `  Highest Score: ${stats.highestScore.team.name} ` +
    `scored ${stats.highestScore.score} in round ${stats.highestScore.round + 1}`
  );
}

// Output:
// Tournament Statistics:
//   Participants: 8
//   Total Rounds: 4
//   Byes: 2
//   Average Score: 98.5
//   Completion: 100%
//   Highest Score: Team A scored 120 in round 3
```

#### Generate Reports (Multiple Formats)

##### Plain Text Report

```typescript
const textReport = bracket.generateReport({
  format: 'text',
  includeScores: true,
  includeStatistics: true
});

console.log(textReport);

// Output:
// ==================================================
// TOURNAMENT REPORT
// ==================================================
// 
// Tournament Statistics:
// - Total Participants: 8
// - Total Rounds: 4
// - Total Matches: 7
// - Completed: 7/7 (100%)
// - Byes: 2
// - Average Score: 98.5
// 
// QUARTERFINALS
//   ✓ Match 1: Team A (100) defeated Team B (85)
//   ✓ Match 2: Team C (90) defeated Team D (88)
//   ✓ Match 3: Team E (BYE)
//   ✓ Match 4: Team F (BYE)
// 
//   Advancing: Team A, Team C, Team E, Team F
// 
// SEMIFINALS
//   ✓ Match 1: Team A (95) defeated Team E (88)
//   ✓ Match 2: Team C (92) defeated Team F (90)
// 
//   Advancing: Team A, Team C
// 
// FINALS
//   ✓ Match 1: Team A (102) defeated Team C (99)
// 
//   Advancing: Team A
// 
// CHAMPION: Team A (Seed 1)
// ==================================================
```

##### JSON Report (For APIs)

```typescript
const jsonReport = bracket.generateReport({ format: 'json' });

// Use in API calls
fetch('/api/tournaments/123/results', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(jsonReport)
});

// Or save to file
const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'tournament-results.json';
a.click();
```

##### HTML Report (For Web Display)

```typescript
const htmlReport = bracket.generateReport({
  format: 'html',
  includeScores: true,
  includeStatistics: true
});

// Display in your app
document.getElementById('tournament-results').innerHTML = htmlReport;

// Result: Beautiful HTML table with all tournament data
```

##### Markdown Report (For Documentation)

```typescript
const mdReport = bracket.generateReport({
  format: 'markdown',
  includeScores: true
});

// Save for documentation
const blob = new Blob([mdReport], { type: 'text/markdown' });
// ... download logic

// Result: Markdown tables perfect for GitHub, docs, etc.
```

---

## 🖼️ Framework Integration

### React

```tsx
import { GracketReact } from 'gracket/react';
import { generateTournamentWithByes } from 'gracket';
import 'gracket/style.css';
import { useState } from 'react';

function TournamentBracket() {
  const [data, setData] = useState(() => 
    generateTournamentWithByes(teams, 'top-seeds')
  );
  const [gracket, setGracket] = useState<Gracket | null>(null);

  const handleScoreUpdate = (r: number, g: number, t: number, score: number) => {
    console.log(`Score: ${score}`);
    
    // Auto-advance when round completes
    if (gracket?.isRoundComplete(r)) {
      gracket.advanceRound(r, { 
        tieBreaker: 'higher-seed',
        createRounds: true 
      });
      setData([...gracket.getData()]);
    }
  };

  return (
    <div>
      <GracketReact
        data={data}
        byeLabel="BYE"
        cornerRadius={15}
        canvasLineColor="#667eea"
        roundLabels={['Round 1', 'Semifinals', 'Finals', 'Champion']}
        onInit={(g) => setGracket(g)}
        onScoreUpdate={handleScoreUpdate}
        onRoundComplete={(r) => {
          const advancing = gracket?.getAdvancingTeams(r);
          console.log('Advancing:', advancing);
        }}
      />
      
      {gracket && (
        <div className="tournament-controls">
          <button onClick={() => {
            const report = gracket.generateReport({ 
              format: 'text',
              includeStatistics: true 
            });
            alert(report);
          }}>
            Generate Report
          </button>
          
          <button onClick={() => {
            const stats = gracket.getStatistics();
            console.log('Stats:', stats);
          }}>
            Show Statistics
          </button>
        </div>
      )}
    </div>
  );
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { GracketVue } from 'gracket/vue';
import { generateTournamentWithByes, type Gracket } from 'gracket';
import 'gracket/style.css';

const teams = ref([/* your teams */]);
const data = ref(generateTournamentWithByes(teams.value, 'top-seeds'));
const gracket = ref<Gracket | null>(null);

const options = ref({
  byeLabel: 'BYE',
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Champion']
});

const handleInit = (g: Gracket) => {
  gracket.value = g;
};

const handleScoreUpdate = (r: number, g: number, t: number, score: number) => {
  if (gracket.value?.isRoundComplete(r)) {
    gracket.value.advanceRound(r, { 
      tieBreaker: 'higher-seed',
      createRounds: true 
    });
    data.value = [...gracket.value.getData()];
  }
};

const generateReport = () => {
  if (!gracket.value) return;
  
  const report = gracket.value.generateReport({
    format: 'text',
    includeStatistics: true
  });
  
  alert(report);
};

const showStats = () => {
  if (!gracket.value) return;
  
  const stats = gracket.value.getStatistics();
  console.log('Statistics:', stats);
};

const advancingTeams = computed(() => {
  if (!gracket.value) return [];
  return gracket.value.getAdvancingTeams();
});
</script>

<template>
  <div>
    <GracketVue
      :data="data"
      :options="options"
      @init="handleInit"
      @score-update="handleScoreUpdate"
      @round-complete="(r) => console.log('Round complete:', r)"
    />
    
    <div class="controls">
      <button @click="generateReport">Generate Report</button>
      <button @click="showStats">Show Statistics</button>
    </div>
    
    <div v-if="advancingTeams.length" class="advancing">
      <h3>Advancing Teams:</h3>
      <ul>
        <li v-for="team in advancingTeams" :key="team.id">
          {{ team.name }} (Seed {{ team.seed }})
        </li>
      </ul>
    </div>
  </div>
</template>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/gracket/dist/style.css" />
</head>
<body>
  <div id="bracket"></div>
  
  <div class="controls">
    <button id="generate-report">Generate Report</button>
    <button id="show-stats">Show Statistics</button>
    <button id="show-advancing">Show Advancing Teams</button>
  </div>
  
  <script type="module">
    import { Gracket, generateTournamentWithByes } from 'https://unpkg.com/gracket';
    
    const teams = [
      { name: 'Warriors', id: 'warriors', seed: 1 },
      { name: 'Lakers', id: 'lakers', seed: 2 },
      { name: 'Celtics', id: 'celtics', seed: 3 },
      { name: 'Heat', id: 'heat', seed: 4 },
      { name: 'Bucks', id: 'bucks', seed: 5 },
      { name: 'Suns', id: 'suns', seed: 6 }
    ];
    
    const data = generateTournamentWithByes(teams, 'top-seeds');
    
    const bracket = new Gracket('#bracket', {
      src: data,
      byeLabel: 'BYE',
      roundLabels: ['Round 1', 'Semifinals', 'Finals', 'Champion'],
      
      onScoreUpdate: (r, g, t, score) => {
        if (bracket.isRoundComplete(r)) {
          bracket.advanceRound(r, { createRounds: true });
        }
      },
      
      onRoundComplete: (r) => {
        console.log('Round complete:', r);
      }
    });
    
    // Event listeners
    document.getElementById('generate-report').addEventListener('click', () => {
      const report = bracket.generateReport({
        format: 'text',
        includeStatistics: true
      });
      alert(report);
    });
    
    document.getElementById('show-stats').addEventListener('click', () => {
      const stats = bracket.getStatistics();
      console.log('Statistics:', stats);
    });
    
    document.getElementById('show-advancing').addEventListener('click', () => {
      const advancing = bracket.getAdvancingTeams();
      console.log('Advancing teams:', advancing.map(t => t.name));
    });
  </script>
</body>
</html>
```

---

## 📖 Complete API Reference

### Constructor

```typescript
new Gracket(container: HTMLElement | string, options?: GracketOptions)
```

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | `TournamentData` | `[]` | Tournament bracket data |
| `gracketClass` | `string` | `'g_gracket'` | CSS class for main container |
| `gameClass` | `string` | `'g_game'` | CSS class for game containers |
| `roundClass` | `string` | `'g_round'` | CSS class for round containers |
| `teamClass` | `string` | `'g_team'` | CSS class for team containers |
| `winnerClass` | `string` | `'g_winner'` | CSS class for winner container |
| `currentClass` | `string` | `'g_current'` | CSS class for hover state |
| `cornerRadius` | `number` | `15` | Corner radius for bracket lines (px) |
| `canvasLineColor` | `string` | `'#eee'` | Color of bracket lines |
| `canvasLineWidth` | `number` | `2` | Width of bracket lines (px) |
| `canvasLineGap` | `number` | `15` | Gap between elements and lines (px) |
| `canvasLineCap` | `'round' \| 'square' \| 'butt'` | `'round'` | Line cap style |
| `roundLabels` | `string[]` | `[]` | Custom labels for each round |

### NEW: Byes Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `byeLabel` | `string` | `'BYE'` | Label for bye placeholders |
| `byeClass` | `string` | `'g_bye'` | CSS class for bye elements |
| `showByeGames` | `boolean` | `true` | Show/hide bye visualizations |

### NEW: Event Callbacks

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onScoreUpdate` | `(roundIndex, gameIndex, teamIndex, score)` | Fired when score is updated |
| `onRoundComplete` | `(roundIndex)` | Fired when round completes |
| `onRoundGenerated` | `(roundIndex, roundData)` | Fired when new round is created |

### Core Methods

#### `update(data: TournamentData): void`
Update the bracket with new tournament data and re-render.

```typescript
bracket.update(newTournamentData);
```

#### `destroy(): void`
Remove the bracket and clean up event listeners.

```typescript
bracket.destroy();
```

#### `getSettings(): GracketSettings`
Get current bracket settings.

```typescript
const settings = bracket.getSettings();
console.log(settings.byeLabel);  // 'BYE'
```

#### `getData(): TournamentData`
Get current tournament data (read-only copy).

```typescript
const data = bracket.getData();
console.log(data.length);  // Number of rounds
```

### NEW: Score Management Methods

#### `updateScore(roundIndex: number, gameIndex: number, teamIndex: number, score: number): void`
Update a team's score in a specific match.

```typescript
// Round 0, Game 0, Team 0: 100 points
bracket.updateScore(0, 0, 0, 100);
```

#### `getMatchWinner(roundIndex: number, gameIndex: number): Team | null`
Get the winner of a specific match (null if incomplete).

```typescript
const winner = bracket.getMatchWinner(0, 0);
if (winner) {
  console.log(`Winner: ${winner.name}`);
}
```

#### `isRoundComplete(roundIndex: number): boolean`
Check if all matches in a round are complete.

```typescript
if (bracket.isRoundComplete(0)) {
  console.log('Round 0 is complete!');
}
```

### NEW: Round Advancement Methods

#### `advanceRound(fromRound?: number, options?: AdvanceOptions): TournamentData`
Advance winners to the next round.

```typescript
bracket.advanceRound(0, {
  tieBreaker: 'higher-seed',   // How to handle ties
  tieBreakerFn: undefined,      // Custom tie-breaker
  preserveScores: false,        // Keep scores
  createRounds: true            // Create next round if missing
});
```

**AdvanceOptions:**
- `tieBreaker`: `'error' | 'higher-seed' | 'lower-seed' | 'callback'` (default: `'error'`)
- `tieBreakerFn`: `(team1: Team, team2: Team) => Team`
- `preserveScores`: `boolean` (default: `false`)
- `createRounds`: `boolean` (default: `false`)

#### `autoGenerateTournament(options?: AutoGenerateOptions): void`
Automatically generate entire tournament from results.

```typescript
bracket.autoGenerateTournament({
  tieBreaker: 'higher-seed',
  onRoundGenerated: (idx, data) => {
    console.log(`Round ${idx + 1} generated`);
  },
  stopAtRound: 3  // Optional: stop at specific round
});
```

### NEW: Reporting Methods

#### `getAdvancingTeams(roundIndex?: number): Team[]`
Get teams advancing from a round (default: latest completed round).

```typescript
const advancing = bracket.getAdvancingTeams(0);
console.log(advancing.map(t => t.name));
```

#### `getRoundResults(roundIndex: number): MatchResult[]`
Get detailed results for a round.

```typescript
const results = bracket.getRoundResults(0);
results.forEach(r => {
  console.log(`${r.winner.name} defeated ${r.loser?.name || 'BYE'}`);
});
```

#### `getTeamHistory(teamId: string): TeamHistory | null`
Get a team's complete tournament history.

```typescript
const history = bracket.getTeamHistory('warriors');
console.log(`${history.team.name}: ${history.wins}W-${history.losses}L`);
```

#### `getStatistics(): TournamentStatistics`
Get tournament statistics.

```typescript
const stats = bracket.getStatistics();
console.log(`Completion: ${stats.completionPercentage}%`);
console.log(`Average score: ${stats.averageScore}`);
```

#### `generateReport(options?: ReportOptions): TournamentReport | string`
Generate formatted tournament report.

```typescript
// JSON format
const jsonReport = bracket.generateReport({ format: 'json' });

// Plain text
const textReport = bracket.generateReport({ 
  format: 'text',
  includeScores: true,
  includeStatistics: true 
});

// HTML
const htmlReport = bracket.generateReport({ format: 'html' });

// Markdown
const mdReport = bracket.generateReport({ format: 'markdown' });
```

### Utility Functions

#### `generateTournamentWithByes(teams: Team[], strategy?: ByeSeedingStrategy): TournamentData`
Generate tournament structure with byes for non-power-of-2 team counts.

```typescript
const teams = [/* 6 teams */];
const data = generateTournamentWithByes(teams, 'top-seeds');
```

**Strategies:**
- `'top-seeds'` - Top-seeded teams get byes (default)
- `'random'` - Random teams get byes

#### `calculateByesNeeded(teamCount: number): number`
Calculate how many byes are needed for a tournament.

```typescript
import { calculateByesNeeded } from 'gracket';

const byesNeeded = calculateByesNeeded(6);  // Returns 2
```

---

## 🎨 Styling & Customization

Gracket includes beautiful default styles, but everything is customizable.

### Basic Customization

```css
/* Customize team colors */
.g_team {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.g_team:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

/* Customize winner display */
.g_winner {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: 3px solid #ffd700;
}

.g_winner .g_team {
  background: rgba(255, 215, 0, 0.2);
  border-left: 6px solid #ffd700;
}

/* Customize round labels */
.g_round_label {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  padding: 10px 20px;
}

/* Customize bye placeholders */
.g_bye {
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px dashed #6c757d !important;
  opacity: 0.6;
  font-style: italic;
}

/* Customize seed badges */
.g_seed {
  background: #667eea;
  color: white;
  font-weight: bold;
  border-radius: 4px;
  padding: 4px 8px;
}

/* Customize scores */
.g_score {
  font-size: 24px;
  font-weight: 900;
  color: #667eea;
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}
```

### Dark Theme Example

```css
.g_gracket {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.g_team {
  background: linear-gradient(90deg, #0f3460 0%, #16213e 100%);
  border-left-color: #e94560;
  color: #ffffff;
}

.g_team:hover {
  background: linear-gradient(90deg, #16213e 0%, #1a1a2e 100%);
  border-left-color: #00d4ff;
}

.g_bye {
  background: linear-gradient(90deg, rgba(15, 52, 96, 0.3) 0%, rgba(22, 33, 62, 0.3) 100%);
  border-left-color: #5a7a94 !important;
}
```

### Light Theme Example

```css
.g_gracket {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.g_team {
  background: linear-gradient(90deg, #ffffff 0%, #f8f9fa 100%);
  border-left-color: #667eea;
  color: #333333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.g_team:hover {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateX(3px);
}

.g_bye {
  background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
  border-left-style: dashed;
  border-left-color: #adb5bd !important;
}
```

---

## 💻 TypeScript Support

Gracket is built with TypeScript and includes comprehensive type definitions.

### Core Types

```typescript
// Team/Player
interface Team {
  name: string;              // Team/player name
  id?: string;               // Unique identifier
  seed: number;              // Tournament seed
  displaySeed?: string | number;  // Alternative seed display
  score?: number;            // Match score
}

// Game structure
type Game = Team[];          // 1 team (bye) or 2 teams (match)
type Round = Game[];         // Array of games
type TournamentData = Round[];  // Complete tournament

// Match result
interface MatchResult {
  winner: Team;
  loser: Team | null;        // null for byes
  winnerScore?: number;
  loserScore?: number;
  isBye: boolean;
}

// Team history
interface TeamHistory {
  team: Team;
  matches: MatchEntry[];
  finalPlacement?: number;   // 1st, 2nd, 3rd, etc.
  wins: number;
  losses: number;
}

// Tournament statistics
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

// And many more...
```

### Type-Safe Usage

```typescript
import type { 
  Gracket,
  Team,
  TournamentData,
  GracketOptions,
  MatchResult,
  TeamHistory,
  TournamentStatistics,
  ReportOptions
} from 'gracket';

// Type-safe team data
const teams: Team[] = [
  { name: 'Warriors', id: 'warriors', seed: 1 },
  { name: 'Lakers', id: 'lakers', seed: 2 }
];

// Type-safe options
const options: GracketOptions = {
  src: tournamentData,
  byeLabel: 'BYE',
  cornerRadius: 15,
  onScoreUpdate: (r, g, t, score) => {
    console.log(`Score: ${score}`);
  }
};

// Type-safe bracket
const bracket: Gracket = new Gracket('#bracket', options);

// Type-safe results
const results: MatchResult[] = bracket.getRoundResults(0);
const history: TeamHistory | null = bracket.getTeamHistory('warriors');
const stats: TournamentStatistics = bracket.getStatistics();

// Type-safe report options
const reportOptions: ReportOptions = {
  format: 'json',
  includeScores: true,
  includeStatistics: true
};
```

---

## 🎓 Advanced Examples

### Example 1: March Madness Style Bracket

```typescript
import { Gracket, generateTournamentWithByes } from 'gracket';

// 64 teams (power of 2, no byes needed)
const teams = Array.from({ length: 64 }, (_, i) => ({
  name: `Team ${i + 1}`,
  id: `team-${i + 1}`,
  seed: i + 1
}));

const data = generateTournamentWithByes(teams, 'top-seeds');

const bracket = new Gracket('#bracket', {
  src: data,
  roundLabels: [
    'Round of 64',
    'Round of 32',
    'Sweet 16',
    'Elite 8',
    'Final Four',
    'Championship',
    'Winner'
  ],
  cornerRadius: 10,
  canvasLineColor: '#003366',
  canvasLineWidth: 3
});
```

### Example 2: Real-Time Score Updates

```typescript
// Connect to WebSocket for live updates
const socket = new WebSocket('wss://tournament-server.com');

const bracket = new Gracket('#bracket', {
  src: tournamentData,
  
  onScoreUpdate: (r, g, t, score) => {
    // Broadcast score to all spectators
    socket.send(JSON.stringify({
      type: 'score_update',
      round: r,
      game: g,
      team: t,
      score
    }));
  }
});

// Receive live updates
socket.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'score_update') {
    bracket.updateScore(
      update.round,
      update.game,
      update.team,
      update.score
    );
  }
};
```

### Example 3: Tournament Dashboard

```typescript
class TournamentDashboard {
  private bracket: Gracket;
  
  constructor(container: string, teams: Team[]) {
    const data = generateTournamentWithByes(teams, 'top-seeds');
    
    this.bracket = new Gracket(container, {
      src: data,
      onRoundComplete: (r) => this.updateDashboard(r)
    });
    
    this.renderDashboard();
  }
  
  renderDashboard() {
    const stats = this.bracket.getStatistics();
    
    document.getElementById('participants').textContent = 
      stats.participantCount.toString();
    document.getElementById('completion').textContent = 
      `${stats.completionPercentage}%`;
    document.getElementById('avg-score').textContent = 
      stats.averageScore?.toFixed(1) || 'N/A';
  }
  
  updateDashboard(round: number) {
    const advancing = this.bracket.getAdvancingTeams(round);
    
    // Update advancing teams list
    const list = document.getElementById('advancing-teams');
    list.innerHTML = advancing
      .map(t => `<li>${t.name} (Seed ${t.seed})</li>`)
      .join('');
    
    // Update stats
    this.renderDashboard();
  }
  
  exportResults(format: 'json' | 'text' | 'html' | 'markdown') {
    const report = this.bracket.generateReport({
      format,
      includeScores: true,
      includeStatistics: true
    });
    
    // Download report
    const blob = new Blob([
      typeof report === 'string' ? report : JSON.stringify(report, null, 2)
    ], { 
      type: format === 'json' ? 'application/json' : 'text/plain'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-results.${format === 'json' ? 'json' : 'txt'}`;
    a.click();
  }
}
```

---

## 📚 Data Structure Deep Dive

### Tournament Data Structure

```typescript
// Tournament is an array of rounds
type TournamentData = Round[];

// Each round is an array of games
type Round = Game[];

// Each game is an array of teams (1 or 2)
type Game = Team[];

// Single team = BYE, Two teams = Match
```

### Example: 6-Team Tournament with Byes

```typescript
const tournamentData: TournamentData = [
  // Round 1 - 2 matches + 2 byes
  [
    // Regular match
    [
      { name: 'Heat', seed: 4, score: 105 },
      { name: 'Bucks', seed: 5, score: 98 }
    ],
    // Regular match
    [
      { name: 'Suns', seed: 3, score: 110 },
      { name: 'Nuggets', seed: 6, score: 102 }
    ],
    // BYE - single team
    [{ name: 'Warriors', seed: 1 }],
    // BYE - single team
    [{ name: 'Lakers', seed: 2 }]
  ],
  
  // Round 2 - 2 matches (all 4 teams play)
  [
    [
      { name: 'Heat', seed: 4, score: 112 },
      { name: 'Warriors', seed: 1, score: 118 }
    ],
    [
      { name: 'Suns', seed: 3, score: 108 },
      { name: 'Lakers', seed: 2, score: 115 }
    ]
  ],
  
  // Round 3 - Finals
  [
    [
      { name: 'Warriors', seed: 1, score: 120 },
      { name: 'Lakers', seed: 2, score: 115 }
    ]
  ],
  
  // Champion
  [
    [{ name: 'Warriors', seed: 1 }]
  ]
];
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start dev server with demo
npm run dev

# Build library
npm run build

# Run linter
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Modern mobile browsers

**Requirements:**
- ES2015+ support
- Canvas API

---

## 📄 License

MIT © [Erik Zettersten](https://github.com/erik5388)

---

## 🙏 Acknowledgments

This is a modernized version of the original jquery.gracket.js plugin. Special thanks to:

- [Andrew Miller](https://github.com/AndrewMillerPSD)
- [James Coutry](https://github.com/jcoutry)
- [Voung Trinh](https://github.com/goods4trade)

---

## 📚 Additional Resources

- 📖 [Live Demo](https://zettersten.github.io/jquery.gracket.js/)
- 💬 [Issue Tracker](https://github.com/erik5388/jquery.gracket.js/issues)
- 📝 [Changelog](CHANGELOG.md)
- 🎓 [Quick Start Guide](QUICK_START_NEW_FEATURES.md)
- 📊 [Feature Examples](FEATURE_EXAMPLES.md)
- 🔍 [API Reference](API_QUICK_REFERENCE.md)

---

## 🆚 Migration from v2.0

**Good news!** All new features in v2.1 are 100% backward compatible. Your existing code will continue to work without any changes.

### Before (v2.0)
```typescript
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  cornerRadius: 15
});
```

### After (v2.1)
```typescript
// Same code works identically
const bracket = new Gracket('#bracket', {
  src: tournamentData,
  cornerRadius: 15
});

// NEW: Optional features available
bracket.updateScore(0, 0, 0, 100);
const advancing = bracket.getAdvancingTeams(0);
const report = bracket.generateReport({ format: 'json' });
```

**Key Changes:**
- ✅ All existing APIs unchanged
- ✅ All existing tests passing
- ✅ New features are opt-in
- ✅ Zero breaking changes

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🚀 What's New in v2.1

### Byes Support (Issue #15)
- Handle any number of teams
- Automatic bye generation
- Visual bye placeholders
- Customizable bye display

### Auto-Generation (Issue #14a)
- Interactive score entry
- Automatic round advancement
- Multiple tie-breaking strategies
- Event callbacks
- Full tournament auto-generation

### Reporting & Statistics (Issue #14b)
- Query advancing teams
- Track team history
- Generate reports (JSON, text, HTML, markdown)
- Calculate tournament statistics
- Export functionality

---

Made with ❤️ by [Erik Zettersten](https://github.com/erik5388)

**Ready to build amazing tournament brackets? Get started now!** 🏆
