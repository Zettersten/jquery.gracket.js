# 🏆 Gracket

> A modern, framework-agnostic single elimination tournament bracket library

[![npm version](https://img.shields.io/npm/v/gracket.svg)](https://www.npmjs.com/package/gracket)
[![Build Status](https://github.com/erik5388/jquery.gracket.js/workflows/CI/badge.svg)](https://github.com/erik5388/jquery.gracket.js/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Gracket** is a powerful, modern tournament bracket library built with TypeScript and zero dependencies. It works seamlessly with React, Vue, Angular, or vanilla JavaScript.

## ✨ Features

- 🎨 **Modern & Beautiful** - Clean, responsive design with smooth animations
- ⚡ **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS
- 📦 **TypeScript** - Full TypeScript support with comprehensive type definitions
- 🎯 **Zero Dependencies** - No jQuery required - pure modern JavaScript
- 🎨 **Customizable** - Extensive options for styling and behavior
- ♿ **Accessible** - Built with accessibility in mind
- 🚀 **Tree Shakable** - ES modules with optimal bundle size
- 📱 **Responsive** - Works on all screen sizes

## 🚀 Quick Start

### Installation

```bash
npm install gracket
# or
yarn add gracket
# or
pnpm add gracket
```

### Basic Usage

#### Vanilla JavaScript/TypeScript

```typescript
import { Gracket } from 'gracket';
import 'gracket/style.css';

const tournamentData = [
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team B', seed: 8, score: 85 },
    ],
    [
      { name: 'Team C', seed: 4, score: 90 },
      { name: 'Team D', seed: 5, score: 88 },
    ],
  ],
  [
    [
      { name: 'Team A', seed: 1, score: 95 },
      { name: 'Team C', seed: 4, score: 92 },
    ],
  ],
  [[{ name: 'Team A', seed: 1 }]],
];

const bracket = new Gracket('#bracket', {
  src: tournamentData,
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals'],
});

// Update bracket
bracket.update(newData);

// Clean up
bracket.destroy();
```

#### React

```tsx
import { GracketReact } from 'gracket/react';
import 'gracket/style.css';

function TournamentBracket() {
  const [data, setData] = useState(tournamentData);

  return (
    <GracketReact
      data={data}
      cornerRadius={15}
      canvasLineColor="#667eea"
      roundLabels={['Quarter Finals', 'Semi Finals', 'Finals']}
      onInit={(gracket) => console.log('Bracket initialized!', gracket)}
    />
  );
}
```

#### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { GracketVue } from 'gracket/vue';
import 'gracket/style.css';

const data = ref(tournamentData);
const options = ref({
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals'],
});
</script>

<template>
  <GracketVue
    :data="data"
    :options="options"
    @init="(gracket) => console.log('Bracket initialized!', gracket)"
  />
</template>
```

#### HTML (CDN)

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/gracket/dist/style.css" />
  </head>
  <body>
    <div id="bracket" data-gracket='[{},{},{}]'></div>
    
    <script type="module">
      import { Gracket } from 'https://unpkg.com/gracket';
      new Gracket('#bracket');
    </script>
  </body>
</html>
```

## 📖 API Reference

### Constructor

```typescript
new Gracket(container: HTMLElement | string, options?: GracketOptions)
```

### Options

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

### Methods

#### `update(data: TournamentData): void`
Update the bracket with new tournament data.

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
```

#### `getData(): TournamentData`
Get current tournament data.

```typescript
const data = bracket.getData();
```

## 📊 Data Structure

```typescript
interface Team {
  name: string;           // Team/player name
  id?: string;            // Unique identifier
  seed: number;           // Tournament seed
  displaySeed?: string | number;  // Alternative seed display
  score?: number;         // Match score
}

type Game = Team[];       // Array of teams in a game
type Round = Game[];      // Array of games in a round
type TournamentData = Round[];  // Full tournament structure
```

### Example Data

```typescript
const tournamentData: TournamentData = [
  // Round 1
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 100 },
      { name: 'Team B', id: 'team-b', seed: 8, score: 85 }
    ],
    [
      { name: 'Team C', id: 'team-c', seed: 4, score: 90 },
      { name: 'Team D', id: 'team-d', seed: 5, score: 88 }
    ]
  ],
  // Round 2
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1, score: 95 },
      { name: 'Team C', id: 'team-c', seed: 4, score: 92 }
    ]
  ],
  // Winner
  [
    [
      { name: 'Team A', id: 'team-a', seed: 1 }
    ]
  ]
];
```

## 🎨 Styling

Gracket includes default styles, but you can fully customize the appearance using CSS:

```css
/* Customize team colors */
.g_team {
  background: #your-color;
}

.g_team:last-child {
  background: #another-color;
}

/* Customize hover state */
.g_current {
  background: #highlight-color !important;
}

/* Customize winner */
.g_winner {
  background: #winner-color;
}

/* Customize round labels */
.g_round_label {
  color: #label-color;
  font-size: 18px;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build library
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 📦 Building

The library is built using Vite and outputs multiple formats:

- **ES Module** (`dist/gracket.js`) - For modern bundlers
- **UMD** (`dist/gracket.umd.cjs`) - For legacy environments
- **TypeScript Types** (`dist/*.d.ts`) - Full type definitions
- **CSS** (`dist/style.css`) - Default styles

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Modern mobile browsers

Canvas API support required.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Erik Zettersten](https://github.com/erik5388)

## 🙏 Acknowledgments

This is a modernized version of the original jquery.gracket.js plugin. Special thanks to:

- [Andrew Miller](https://github.com/AndrewMillerPSD)
- [James Coutry](https://github.com/jcoutry)
- [Voung Trinh](https://github.com/goods4trade)

## 📚 Resources

- [Live Demo](https://zettersten.github.io/jquery.gracket.js/)
- [Documentation](https://github.com/erik5388/jquery.gracket.js#readme)
- [Issue Tracker](https://github.com/erik5388/jquery.gracket.js/issues)
- [Changelog](CHANGELOG.md)

## 🆚 Migration from v1.x

If you're migrating from the jQuery version:

### Before (v1.x)
```javascript
$('#bracket').gracket({
  src: data,
  cornerRadius: 15
});
```

### After (v2.x)
```typescript
import { Gracket } from 'gracket';

new Gracket('#bracket', {
  src: data,
  cornerRadius: 15
});
```

Key changes:
- ✅ No jQuery dependency
- ✅ ES modules instead of global variable
- ✅ TypeScript support
- ✅ Framework adapters included
- ✅ Same API, modern implementation

---

Made with ❤️ by [Erik Zettersten](https://github.com/erik5388)
