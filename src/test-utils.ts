import type { TournamentData } from './types';

/**
 * Generate tournament data for testing
 */
export const generateTournamentData = (teams: number = 8): TournamentData => {
  if (teams < 2 || (teams & (teams - 1)) !== 0) {
    throw new Error('Number of teams must be a power of 2');
  }

  const rounds: TournamentData = [];
  let currentTeams = teams;
  let teamCounter = 1;

  // Generate initial round
  const firstRound = [];
  for (let i = 0; i < teams / 2; i++) {
    firstRound.push([
      { name: `Team ${teamCounter}`, id: `team-${teamCounter}`, seed: teamCounter },
      { name: `Team ${teamCounter + 1}`, id: `team-${teamCounter + 1}`, seed: teamCounter + 1 },
    ]);
    teamCounter += 2;
  }
  rounds.push(firstRound);

  // Generate subsequent rounds
  currentTeams = teams / 2;
  while (currentTeams >= 1) {
    const round = [];
    for (let i = 0; i < currentTeams; i++) {
      round.push([{ name: `Winner ${i + 1}`, id: `winner-${i + 1}`, seed: i + 1 }]);
    }
    rounds.push(round);
    currentTeams = currentTeams / 2;
  }

  return rounds;
};

/**
 * Sample tournament data for demos
 */
export const sampleTournamentData: TournamentData = [
  [
    [
      { name: 'Erik Zettersten', id: 'erik-zettersten', seed: 1, displaySeed: 'D1', score: 47 },
      { name: 'Andrew Miller', id: 'andrew-miller', seed: 2 },
    ],
    [
      { name: 'James Coutry', id: 'james-coutry', seed: 3 },
      { name: 'Sam Merrill', id: 'sam-merrill', seed: 4 },
    ],
    [
      { name: 'Anthony Hopkins', id: 'anthony-hopkins', seed: 5 },
      { name: 'Everett Zettersten', id: 'everett-zettersten', seed: 6 },
    ],
    [
      { name: 'John Scott', id: 'john-scott', seed: 7 },
      { name: 'Teddy Koufus', id: 'teddy-koufus', seed: 8 },
    ],
    [
      { name: 'Arnold Palmer', id: 'arnold-palmer', seed: 9 },
      { name: 'Ryan Anderson', id: 'ryan-anderson', seed: 10 },
    ],
    [
      { name: 'Jesse James', id: 'jesse-james', seed: 11 },
      { name: 'Scott Anderson', id: 'scott-anderson', seed: 12 },
    ],
    [
      { name: 'Josh Groben', id: 'josh-groben', seed: 13 },
      { name: 'Sammy Zettersten', id: 'sammy-zettersten', seed: 14 },
    ],
    [
      { name: 'Jake Coutry', id: 'jake-coutry', seed: 15 },
      { name: 'Spencer Zettersten', id: 'spencer-zettersten', seed: 16 },
    ],
  ],
  [
    [
      { name: 'Erik Zettersten', id: 'erik-zettersten', seed: 1 },
      { name: 'James Coutry', id: 'james-coutry', seed: 3 },
    ],
    [
      { name: 'Anthony Hopkins', id: 'anthony-hopkins', seed: 5 },
      { name: 'Teddy Koufus', id: 'teddy-koufus', seed: 8 },
    ],
    [
      { name: 'Ryan Anderson', id: 'ryan-anderson', seed: 10 },
      { name: 'Scott Anderson', id: 'scott-anderson', seed: 12 },
    ],
    [
      { name: 'Sammy Zettersten', id: 'sammy-zettersten', seed: 14 },
      { name: 'Jake Coutry', id: 'jake-coutry', seed: 15 },
    ],
  ],
  [
    [
      { name: 'Erik Zettersten', id: 'erik-zettersten', seed: 1 },
      { name: 'Anthony Hopkins', id: 'anthony-hopkins', seed: 5 },
    ],
    [
      { name: 'Ryan Anderson', id: 'ryan-anderson', seed: 10 },
      { name: 'Sammy Zettersten', id: 'sammy-zettersten', seed: 14 },
    ],
  ],
  [
    [
      { name: 'Erik Zettersten', id: 'erik-zettersten', seed: 1 },
      { name: 'Ryan Anderson', id: 'ryan-anderson', seed: 10 },
    ],
  ],
  [[{ name: 'Erik Zettersten', id: 'erik-zettersten', seed: 1 }]],
];
