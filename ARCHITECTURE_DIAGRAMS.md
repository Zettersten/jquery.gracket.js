# Architecture Diagrams

This document provides visual representations of the proposed features for Issues #14 and #15.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        GRACKET v2.1.0                             │
│                   Enhanced Tournament Brackets                     │
└───────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
          ┌─────────▼──────────┐   ┌─────────▼──────────┐
          │   EXISTING API     │   │    NEW FEATURES    │
          │   (Unchanged)      │   │   (Issues #14-15)  │
          └─────────┬──────────┘   └─────────┬──────────┘
                    │                        │
       ┌────────────┼────────────┐          │
       │            │            │          │
   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐      │
   │Update │   │Render │   │Events │      │
   │Data   │   │Visual │   │Mouse  │      │
   └───────┘   └───────┘   └───────┘      │
                                           │
                    ┌──────────────────────┘
                    │
       ┌────────────┼────────────┬───────────────┐
       │            │            │               │
   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐      ┌───▼────┐
   │ BYES  │   │ AUTO  │   │REPORT │      │ UTILS  │
   │ #15   │   │ GEN   │   │ #14b  │      │HELPERS │
   │       │   │ #14a  │   │       │      │        │
   └───┬───┘   └───┬───┘   └───┬───┘      └───┬────┘
       │           │           │              │
       └───────────┴───────────┴──────────────┘
                       │
              ┌────────▼────────┐
              │  Tournament     │
              │  Data Model     │
              └─────────────────┘
```

---

## Data Structure Evolution

### Current Structure (v2.0)

```
TournamentData = Round[]

Round = Game[]

Game = [Team, Team]  ← Always 2 teams

Team = {
  name: string
  id?: string
  seed: number
  score?: number
}
```

### Enhanced Structure (v2.1 - Issue #15)

```
TournamentData = Round[]

Round = Game[]

Game = [Team, Team]      ← Normal matchup
     | [Team]            ← BYE (new!)

Team = {
  name: string
  id?: string
  seed: number
  score?: number
}
```

**Key Change**: Games can have 1 team (bye) or 2 teams (match)

---

## Byes Feature Flow (Issue #15)

```
┌──────────────────────────────────────────────────────────────┐
│ INPUT: 6 Teams                                               │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│ generateTournamentWithByes(teams, 'top-seeds')                 │
└────────────┬───────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│ ROUND 1: [                                                     │
│   [ {Heat}, {Bucks} ],        ← 2 teams (regular match)       │
│   [ {Suns}, {Nuggets} ],      ← 2 teams (regular match)       │
│   [ {Warriors} ],             ← 1 team (BYE)                   │
│   [ {Lakers} ]                ← 1 team (BYE)                   │
│ ]                                                              │
└────────────┬───────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│ Gracket.buildBracket()                                         │
└────────────┬───────────────────────────────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
┌──────────┐ ┌──────────┐
│ game.    │ │ game.    │
│ length   │ │ length   │
│ === 2    │ │ === 1    │
└────┬─────┘ └────┬─────┘
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│ Regular │  │ Create  │
│ Match   │  │ Bye     │
│ Element │  │ Element │
└─────────┘  └─────────┘
```

**Visual Result:**

```
ROUND 1                    ROUND 2
┌──────────────┐
│ Heat      105│─────┐
│ Bucks      98│     │     ┌──────────────┐
└──────────────┘     ├─────┤ Heat         │
                     │     │ Warriors     │
┌──────────────┐     │     │              │
│ Suns      110│─────┘     └──────────────┘
│ Nuggets   102│           
└──────────────┘           
                           
┌──────────────┐           
│ Warriors     │─────┐     
│ BYE          │     │     
└──────────────┘     │     
                     │     
┌──────────────┐     │     
│ Lakers       │─────┘     
│ BYE          │           
└──────────────┘           
```

---

## Auto-Generation Flow (Issue #14a)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Enter Score                                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ bracket.updateScore(round, game, team, score)              │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ Update internal data structure                             │
│ Fire onScoreUpdate callback                                │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ Check: Are both teams scored?                              │
└────────────┬───────────────────────────────────────────────┘
             │
        ┌────┴────┐
        │         │
      Yes        No
        │         │
        ▼         ▼
   ┌─────────┐ ┌──────────┐
   │Determine│ │ Wait for │
   │ Winner  │ │more input│
   └────┬────┘ └──────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ Check: bracket.isRoundComplete(round)?                     │
└────────────┬───────────────────────────────────────────────┘
             │
        ┌────┴────┐
        │         │
      Yes        No
        │         │
        ▼         ▼
   ┌─────────┐ ┌──────────┐
   │Advance  │ │ Wait for │
   │ Round   │ │more games│
   └────┬────┘ └──────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ bracket.advanceRound(round, options)                       │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────┐
│ 1. Collect all winners from current round                  │
│ 2. Create games pairing winners                            │
│ 3. Add to tournament data                                  │
│ 4. Re-render bracket                                       │
│ 5. Fire onRoundComplete callback                           │
└─────────────────────────────────────────────────────────────┘
```

**Example Timeline:**

```
Time  │ Action                          │ State
──────┼─────────────────────────────────┼──────────────────────
t0    │ User enters: Team A scored 100  │ Round 1, Game 1: [A:100, B:?]
t1    │ User enters: Team B scored 85   │ Round 1, Game 1: [A:100, B:85]
      │                                 │ → Winner: A
t2    │ User enters: Team C scored 90   │ Round 1, Game 2: [C:90, D:?]
t3    │ User enters: Team D scored 88   │ Round 1, Game 2: [C:90, D:88]
      │                                 │ → Winner: C
      │                                 │ → Round 1 COMPLETE!
t4    │ Auto: advanceRound(0)           │ Generate Round 2: [A vs C]
t5    │ User sees new bracket           │ Round 2 ready for scores
```

---

## Reporting Architecture (Issue #14b)

```
┌──────────────────────────────────────────────────────────────┐
│                    REPORTING LAYER                           │
└─────────────┬────────────────────────────────────────────────┘
              │
    ┌─────────┼─────────┬──────────┬──────────┐
    │         │         │          │          │
    ▼         ▼         ▼          ▼          ▼
┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
│ Query  ││History ││Results ││Reports ││ Stats  │
│Methods ││Tracking││Extract ││Generate││Compute │
└───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘
    │         │         │         │         │
    └─────────┴─────────┴─────────┴─────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌───────────────┐
    │ Tournament    │       │ Format        │
    │ Data Model    │       │ Converters    │
    └───────────────┘       └───┬───────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
               ┌────────┐  ┌────────┐  ┌────────┐
               │  JSON  │  │  Text  │  │  HTML  │
               │        │  │        │  │        │
               └────────┘  └────────┘  └────────┘
```

### Query Methods Flow

```
User Request: "Who's advancing?"
         │
         ▼
┌─────────────────────────────────────┐
│ bracket.getAdvancingTeams(roundIdx) │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 1. Get round data                   │
│ 2. For each game:                   │
│    - If 1 team: add team            │
│    - If 2 teams: determine winner   │
│ 3. Collect all winners              │
│ 4. Return as Team[]                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ RESULT: [Team A, Team C, ...]       │
└─────────────────────────────────────┘
```

### Report Generation Flow

```
User Request: "Generate report"
         │
         ▼
┌──────────────────────────────────────────┐
│ bracket.generateReport({ format: 'text'})│
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 1. Collect tournament metadata           │
│    - Total rounds, matches, completion   │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 2. For each round:                       │
│    - Get all match results               │
│    - Determine advancing teams           │
│    - Calculate round statistics          │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 3. Calculate overall statistics          │
│    - Participant count                   │
│    - Average scores                      │
│    - Highest score                       │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 4. Pass to format converter              │
│    - TextReportConverter                 │
│    - JSONReportConverter                 │
│    - HTMLReportConverter                 │
│    - MarkdownReportConverter             │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ 5. Return formatted string               │
└──────────────────────────────────────────┘
```

---

## Class Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Gracket                            │
├─────────────────────────────────────────────────────────┤
│ - container: HTMLElement                                │
│ - data: TournamentData                                  │
│ - settings: GracketSettings                             │
│ - canvas: HTMLCanvasElement                             │
├─────────────────────────────────────────────────────────┤
│ // Existing methods                                     │
│ + constructor(container, options)                       │
│ + update(data): void                                    │
│ + destroy(): void                                       │
│ + getSettings(): GracketSettings                        │
│ + getData(): TournamentData                             │
│                                                         │
│ // NEW: Score management (Issue #14a)                   │
│ + updateScore(r, g, t, score): void                     │
│ + getMatchWinner(r, g): Team | null                     │
│ + isRoundComplete(r): boolean                           │
│                                                         │
│ // NEW: Round advancement (Issue #14a)                  │
│ + advanceRound(r?, options?): TournamentData            │
│ + autoGenerateTournament(options?): void                │
│                                                         │
│ // NEW: Reporting (Issue #14b)                          │
│ + getAdvancingTeams(r?): Team[]                         │
│ + getRoundResults(r): MatchResult[]                     │
│ + getTeamHistory(id): TeamHistory                       │
│ + generateReport(options?): TournamentReport            │
│ + getStatistics(): TournamentStatistics                 │
│                                                         │
│ // Private helpers (existing + new)                     │
│ - buildBracket(): void                                  │
│ - createTeam(team): HTMLElement                         │
│ - createByePlaceholder(): HTMLElement ← NEW             │
│ - drawCanvas(): void                                    │
│ - determineWinner(game): Team ← NEW                     │
│ - generateNextRound(round): Round ← NEW                 │
└─────────────────────────────────────────────────────────┘
```

---

## Interaction Diagram: Complete Tournament Flow

```
User                Gracket              Data              UI
 │                    │                   │                 │
 │ Create bracket     │                   │                 │
 ├───────────────────►│                   │                 │
 │                    │ Initialize        │                 │
 │                    ├──────────────────►│                 │
 │                    │                   │                 │
 │                    │ Render            │                 │
 │                    ├───────────────────┼────────────────►│
 │                    │                   │                 │
 │                    │                   │   Show bracket  │
 │◄───────────────────┼───────────────────┼─────────────────┤
 │                    │                   │                 │
 │ Enter score: 100   │                   │                 │
 ├───────────────────►│                   │                 │
 │                    │ updateScore()     │                 │
 │                    ├──────────────────►│                 │
 │                    │                   │                 │
 │                    │ Callback: onScoreUpdate             │
 │◄───────────────────┤                   │                 │
 │                    │                   │                 │
 │                    │ Update UI         │                 │
 │                    ├───────────────────┼────────────────►│
 │                    │                   │                 │
 │ Enter score: 85    │                   │                 │
 ├───────────────────►│                   │                 │
 │                    │ updateScore()     │                 │
 │                    ├──────────────────►│                 │
 │                    │                   │                 │
 │                    │ isRoundComplete() │                 │
 │                    ├──────────────────►│                 │
 │                    │      true         │                 │
 │                    │◄──────────────────┤                 │
 │                    │                   │                 │
 │                    │ advanceRound()    │                 │
 │                    ├──────────────────►│                 │
 │                    │                   │                 │
 │                    │ Generate Round 2  │                 │
 │                    │◄──────────────────┤                 │
 │                    │                   │                 │
 │                    │ Callback: onRoundComplete           │
 │◄───────────────────┤                   │                 │
 │                    │                   │                 │
 │                    │ Re-render         │                 │
 │                    ├───────────────────┼────────────────►│
 │                    │                   │                 │
 │                    │                   │  Show Round 2   │
 │◄───────────────────┼───────────────────┼─────────────────┤
 │                    │                   │                 │
 │ Get report         │                   │                 │
 ├───────────────────►│                   │                 │
 │                    │ generateReport()  │                 │
 │                    ├──────────────────►│                 │
 │                    │                   │                 │
 │                    │ Process data      │                 │
 │                    │ Format output     │                 │
 │                    │◄──────────────────┤                 │
 │                    │                   │                 │
 │     Report text    │                   │                 │
 │◄───────────────────┤                   │                 │
 │                    │                   │                 │
```

---

## Module Structure

```
gracket/
├── src/
│   ├── core/
│   │   ├── Gracket.ts              ← Enhanced with new methods
│   │   └── Gracket.test.ts         ← Tests for all features
│   │
│   ├── utils/                      ← NEW MODULE
│   │   ├── tournament.ts           ← Tournament utilities
│   │   │   ├── getMatchWinner()
│   │   │   ├── isRoundComplete()
│   │   │   ├── isByeGame()
│   │   │   ├── generateNextRound()
│   │   │   └── applyTieBreaker()
│   │   │
│   │   ├── reporting.ts            ← Reporting utilities
│   │   │   ├── collectAdvancing()
│   │   │   ├── buildTeamHistory()
│   │   │   ├── calculateStats()
│   │   │   └── formatReport()
│   │   │
│   │   ├── byes.ts                 ← Bye utilities
│   │   │   └── generateTournamentWithByes()
│   │   │
│   │   └── __tests__/
│   │       ├── tournament.test.ts
│   │       ├── reporting.test.ts
│   │       └── byes.test.ts
│   │
│   ├── types.ts                    ← Enhanced with new types
│   │   ├── Team (existing)
│   │   ├── Game (existing)
│   │   ├── Round (existing)
│   │   ├── TournamentData (existing)
│   │   ├── GracketOptions (enhanced)
│   │   ├── AdvanceOptions (new)
│   │   ├── MatchResult (new)
│   │   ├── TeamHistory (new)
│   │   ├── TournamentReport (new)
│   │   └── TournamentStatistics (new)
│   │
│   ├── adapters/
│   │   ├── react.tsx               ← Enhanced with new props
│   │   └── vue.ts                  ← Enhanced with new props
│   │
│   ├── index.ts                    ← Export new utilities
│   └── style.css                   ← Add .g_bye styles
│
└── docs/                           ← NEW DOCUMENTATION
    ├── FEATURE_PLAN.md
    ├── FEATURE_SUMMARY.md
    ├── FEATURE_EXAMPLES.md
    ├── API_QUICK_REFERENCE.md
    ├── SOLUTION_OVERVIEW.md
    └── ARCHITECTURE_DIAGRAMS.md    ← This file
```

---

## State Machine: Round Lifecycle

```
                    ┌──────────┐
                    │  EMPTY   │
                    │  ROUND   │
                    └────┬─────┘
                         │
                         │ initialize()
                         ▼
                    ┌──────────┐
                    │  READY   │
                    └────┬─────┘
                         │
                         │ updateScore()
                         ▼
                    ┌──────────┐
                    │ PARTIAL  │
                    │ COMPLETE │
                    └────┬─────┘
                         │
                         │ all games have winners
                         ▼
                    ┌──────────┐
                    │ COMPLETE │
                    └────┬─────┘
                         │
                         │ advanceRound()
                         ▼
                    ┌──────────┐
                    │ADVANCED  │
                    └──────────┘
```

---

## Error Handling Flow

```
User Action
    │
    ▼
┌─────────────────────────────────┐
│ Method Call (e.g., advanceRound)│
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Validation                      │
│ - Check data completeness       │
│ - Verify scores exist           │
│ - Check for ties                │
└────────────┬────────────────────┘
             │
        ┌────┴────┐
        │         │
     Valid    Invalid
        │         │
        ▼         ▼
┌──────────┐ ┌────────────────────┐
│ Execute  │ │ Throw Error        │
│ Method   │ │ with clear message │
└────┬─────┘ └────────┬───────────┘
     │                │
     │                ▼
     │         ┌────────────────────┐
     │         │ User sees:         │
     │         │ "Round incomplete: │
     │         │  Game 2 has no     │
     │         │  winner yet"       │
     │         └────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│ Success                          │
│ - Data updated                   │
│ - UI refreshed                   │
│ - Callbacks fired                │
└──────────────────────────────────┘
```

---

## Performance Considerations

```
Operation               Complexity    Notes
─────────────────────── ───────────── ─────────────────────────
Render bracket          O(n)          n = total teams
Update score            O(1)          Direct data update
Get match winner        O(1)          Simple comparison
Is round complete       O(m)          m = games in round
Advance round           O(m)          m = games in round
Generate report         O(n + r*m)    Full tournament scan
Get team history        O(n + r*m)    Full tournament scan
Get statistics          O(n + r*m)    Full tournament scan

Where:
  n = total number of teams
  r = total number of rounds
  m = average games per round
```

**Optimization Strategy:**
- Cache frequently accessed data
- Lazy-load heavy operations (reports)
- Index teams by ID for fast lookups
- Incremental updates where possible

---

## Browser Compatibility

```
Feature             Chrome  Firefox  Safari  Edge    IE11
─────────────────── ─────── ──────── ─────── ─────── ─────
Core Gracket        ✅      ✅       ✅      ✅      ❌
Byes Support        ✅      ✅       ✅      ✅      ❌
Auto-Generation     ✅      ✅       ✅      ✅      ❌
Reporting           ✅      ✅       ✅      ✅      ❌
Event Callbacks     ✅      ✅       ✅      ✅      ❌

Requirements:
- ES2015+ (arrow functions, classes, etc.)
- Canvas API
- Modern JavaScript features

Note: IE11 not supported (Gracket v2.0 requirement)
```

---

## Deployment Flow

```
┌──────────────┐
│ Development  │
│   Branch     │
└──────┬───────┘
       │
       │ Implement Phase 1-5
       ▼
┌──────────────┐
│ Feature      │
│   Branch     │
└──────┬───────┘
       │
       │ All tests pass
       │ Documentation complete
       ▼
┌──────────────┐
│   Pull       │
│  Request     │
└──────┬───────┘
       │
       │ Code review
       │ CI/CD checks
       ▼
┌──────────────┐
│    Main      │
│   Branch     │
└──────┬───────┘
       │
       │ Build & publish
       ▼
┌──────────────┐
│ NPM Release  │
│  v2.1.0      │
└──────────────┘
```

---

## Summary

These diagrams illustrate:

1. **System Architecture**: How new features integrate with existing code
2. **Data Structures**: Evolution from v2.0 to v2.1
3. **Flow Diagrams**: How features work step-by-step
4. **Class Design**: Enhanced Gracket class structure
5. **Interactions**: How components communicate
6. **Module Organization**: File and folder structure
7. **State Management**: Round lifecycle states
8. **Error Handling**: Validation and error flows
9. **Performance**: Complexity analysis
10. **Deployment**: Release process

All visualizations support the comprehensive plan outlined in the other documentation files.

---

**Document Version**: 1.0  
**Visual Aid for**: Issues #14 & #15 Implementation
