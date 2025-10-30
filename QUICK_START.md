# Quick Start Guide

Get up and running with Gracket in less than 5 minutes!

## 📦 Installation

```bash
npm install gracket
# or
yarn add gracket
# or
pnpm add gracket
```

## 🚀 Basic Usage

### 1. Prepare Your Data

```typescript
const tournamentData = [
  // Round 1 - 4 games, 8 teams
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team H', seed: 8, score: 85 }
    ],
    [
      { name: 'Team D', seed: 4, score: 95 },
      { name: 'Team E', seed: 5, score: 90 }
    ],
    [
      { name: 'Team C', seed: 3, score: 88 },
      { name: 'Team F', seed: 6, score: 82 }
    ],
    [
      { name: 'Team B', seed: 2, score: 92 },
      { name: 'Team G', seed: 7, score: 87 }
    ]
  ],
  // Round 2 - Semi Finals
  [
    [
      { name: 'Team A', seed: 1, score: 98 },
      { name: 'Team D', seed: 4, score: 95 }
    ],
    [
      { name: 'Team C', seed: 3, score: 91 },
      { name: 'Team B', seed: 2, score: 94 }
    ]
  ],
  // Round 3 - Finals
  [
    [
      { name: 'Team A', seed: 1, score: 105 },
      { name: 'Team B', seed: 2, score: 102 }
    ]
  ],
  // Winner
  [
    [
      { name: 'Team A', seed: 1 }
    ]
  ]
];
```

### 2. Create Your Bracket

#### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/gracket/dist/style.css">
</head>
<body>
  <div id="bracket"></div>
  
  <script type="module">
    import { Gracket } from 'gracket';
    
    const bracket = new Gracket('#bracket', {
      src: tournamentData,
      cornerRadius: 15,
      canvasLineColor: '#667eea',
      roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals', 'Champion']
    });
  </script>
</body>
</html>
```

#### React

```tsx
import { GracketReact } from 'gracket/react';
import 'gracket/style.css';

function App() {
  return (
    <div className="App">
      <h1>Tournament Bracket</h1>
      <GracketReact
        data={tournamentData}
        cornerRadius={15}
        canvasLineColor="#667eea"
        roundLabels={['Quarter Finals', 'Semi Finals', 'Finals', 'Champion']}
      />
    </div>
  );
}
```

#### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { GracketVue } from 'gracket/vue';
import 'gracket/style.css';

const tournamentData = ref([/* ... */]);

const options = {
  cornerRadius: 15,
  canvasLineColor: '#667eea',
  roundLabels: ['Quarter Finals', 'Semi Finals', 'Finals', 'Champion']
};
</script>

<template>
  <div class="app">
    <h1>Tournament Bracket</h1>
    <GracketVue :data="tournamentData" :options="options" />
  </div>
</template>
```

## 🎨 Customize Styles

### Using CSS Variables (Recommended)

```css
:root {
  --gracket-primary: #667eea;
  --gracket-secondary: #764ba2;
  --gracket-winner: #ffd700;
}

.g_team {
  background: var(--gracket-primary);
}

.g_team:last-child {
  background: var(--gracket-secondary);
}

.g_winner {
  background: var(--gracket-winner);
}
```

### Using Custom Classes

```javascript
new Gracket('#bracket', {
  src: tournamentData,
  teamClass: 'my-team',
  gameClass: 'my-game',
  winnerClass: 'my-winner'
});
```

## 🔄 Dynamic Updates

```javascript
// Create bracket
const bracket = new Gracket('#bracket', { src: tournamentData });

// Update with new data later
const updatedData = [/* new tournament data */];
bracket.update(updatedData);

// Clean up when done
bracket.destroy();
```

## 📱 Responsive Design

```css
/* Make bracket scrollable on mobile */
.bracket-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Adjust for mobile */
@media (max-width: 768px) {
  .g_gracket {
    padding: 40px 10px 5px;
  }
  
  .g_round {
    margin-right: 40px;
  }
}
```

## 🎯 Common Patterns

### Loading Data from API

```javascript
async function loadBracket() {
  const response = await fetch('/api/tournament');
  const data = await response.json();
  
  new Gracket('#bracket', {
    src: data,
    roundLabels: ['R1', 'R2', 'R3', 'Winner']
  });
}

loadBracket();
```

### Update Scores in Real-time

```javascript
const bracket = new Gracket('#bracket', { src: initialData });

// Update scores every 5 seconds
setInterval(async () => {
  const response = await fetch('/api/tournament/scores');
  const updatedData = await response.json();
  bracket.update(updatedData);
}, 5000);
```

### Custom Round Labels

```javascript
new Gracket('#bracket', {
  src: tournamentData,
  roundLabels: [
    'First Round',
    'Quarter Finals',
    'Semi Finals',
    'Finals',
    '🏆 Champion'
  ]
});
```

## 🐛 Troubleshooting

### Bracket Not Displaying

1. **Check if data is provided:**
   ```javascript
   console.log('Data:', tournamentData);
   ```

2. **Check if CSS is loaded:**
   ```javascript
   import 'gracket/style.css';
   ```

3. **Check container exists:**
   ```javascript
   console.log(document.querySelector('#bracket'));
   ```

### Canvas Lines Not Showing

1. **Check canvas is created:**
   ```javascript
   console.log(document.querySelector('canvas'));
   ```

2. **Check z-index:**
   ```css
   canvas {
     z-index: 1 !important;
   }
   ```

### TypeScript Errors

1. **Install types:**
   ```bash
   npm install --save-dev @types/node
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true
     }
   }
   ```

## 📚 Next Steps

- Read the [full documentation](README.md)
- Check out the [demo application](demo/index.html)
- Learn about [migration from v1.x](MIGRATION.md)
- See [contributing guidelines](CONTRIBUTING.md)

## 💡 Tips

1. **Use unique IDs** - Give each team a unique `id` for proper hover effects
2. **Provide scores** - Include `score` field for teams to display match results
3. **Custom labels** - Use `roundLabels` array for meaningful round names
4. **Test mobile** - Always test your bracket on mobile devices
5. **Optimize data** - Lazy load bracket data for better performance

## 🆘 Need Help?

- 📖 [Read the docs](README.md)
- 💬 [Open an issue](https://github.com/erik5388/jquery.gracket.js/issues)
- 🌟 [Star the repo](https://github.com/erik5388/jquery.gracket.js)

---

Happy bracketing! 🏆
