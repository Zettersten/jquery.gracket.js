# Framework Adapters

Gracket provides first-class adapters for all major frontend frameworks, each following the latest best practices and patterns for their respective ecosystems.

## 📦 Installation

All adapters are included in the main `gracket` package. Simply install once:

```bash
npm install gracket
```

Then import the adapter for your framework:

```typescript
// React
import { GracketReact } from 'gracket/react';

// Vue
import { GracketVue } from 'gracket/vue';

// Angular
import { GracketComponent } from 'gracket/angular';

// SolidJS
import { GracketSolid } from 'gracket/solid';

// Svelte
import { gracket } from 'gracket/svelte';

// Web Components
import { GracketElement } from 'gracket/webcomponent';
```

---

## ⚛️ React Adapter

Modern React 18+ adapter with hooks, memo, and performance optimizations.

### Component Usage

```tsx
import { GracketReact } from 'gracket/react';
import 'gracket/style.css';

function TournamentBracket() {
  const [data, setData] = useState(tournamentData);

  return (
    <GracketReact
      data={data}
      className="my-bracket"
      cornerRadius={20}
      onInit={(instance) => console.log('Initialized!', instance)}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Hook Usage

```tsx
import { useGracket } from 'gracket/react';

function TournamentBracket() {
  const { containerRef, gracket, error, updateScore, advanceRound } = useGracket(
    tournamentData,
    { cornerRadius: 20 }
  );

  return <div ref={containerRef} className="my-bracket" />;
}
```

**Features:**
- ✅ React 18+ memoization and performance optimization
- ✅ Stable refs and callbacks
- ✅ Error boundaries compatible
- ✅ TypeScript support
- ✅ SSR compatible

---

## 🔷 Vue Adapter

Vue 3.5+ adapter with Composition API, composables, and reactivity.

### Component Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { GracketVue } from 'gracket/vue';
import 'gracket/style.css';

const data = ref(tournamentData);
const options = { cornerRadius: 20 };

function handleInit(instance) {
  console.log('Initialized!', instance);
}
</script>

<template>
  <GracketVue
    :data="data"
    :options="options"
    class="my-bracket"
    @init="handleInit"
    @error="handleError"
  />
</template>
```

### Composable Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useGracket } from 'gracket/vue';

const data = ref(tournamentData);
const { containerRef, instance, error, updateScore } = useGracket(data, {
  cornerRadius: 20
});
</script>

<template>
  <div ref="containerRef" class="my-bracket"></div>
</template>
```

**Features:**
- ✅ Vue 3.5+ with latest Composition API patterns
- ✅ Deep reactivity with `shallowRef` optimization
- ✅ Exposed component API via `expose()`
- ✅ TypeScript support
- ✅ SSR compatible

---

## 🅰️ Angular Adapter

Angular 18+ component with signals, standalone components, and modern patterns.

### Component Usage

```typescript
import { Component } from '@angular/core';
import { GracketComponent } from 'gracket/angular';

@Component({
  selector: 'app-tournament',
  standalone: true,
  imports: [GracketComponent],
  template: `
    <gracket
      [data]="tournamentData"
      [options]="options"
      className="my-bracket"
      (init)="onInit($event)"
      (errorOccurred)="onError($event)"
    />
  `
})
export class TournamentComponent {
  tournamentData = [...];
  options = { cornerRadius: 20 };

  onInit(instance: Gracket) {
    console.log('Initialized!', instance);
  }
}
```

### Service Usage

```typescript
import { Component, inject } from '@angular/core';
import { GracketService } from 'gracket/angular';

@Component({
  selector: 'app-tournament',
  template: `<div #container></div>`
})
export class TournamentComponent {
  private gracketService = inject(GracketService);
  @ViewChild('container') container!: ElementRef;

  ngAfterViewInit() {
    this.gracketService.create(
      'my-bracket',
      this.container.nativeElement,
      tournamentData
    );
  }
}
```

**Features:**
- ✅ Angular 18+ with signals and modern patterns
- ✅ Standalone component (no module required)
- ✅ `inject()` function support
- ✅ Change detection optimized
- ✅ TypeScript support

---

## 🔷 SolidJS Adapter

SolidJS adapter with fine-grained reactivity and performance.

### Component Usage

```tsx
import { createSignal } from 'solid-js';
import { GracketSolid } from 'gracket/solid';
import 'gracket/style.css';

function TournamentBracket() {
  const [data, setData] = createSignal(tournamentData);

  return (
    <GracketSolid
      data={data()}
      class="my-bracket"
      cornerRadius={20}
      onInit={(instance) => console.log('Initialized!', instance)}
    />
  );
}
```

### Hook Usage

```tsx
import { useGracket } from 'gracket/solid';

function TournamentBracket() {
  const { containerRef, instance, error, updateScore } = useGracket(
    tournamentData,
    { cornerRadius: 20 }
  );

  return <div ref={containerRef} class="my-bracket" />;
}
```

**Features:**
- ✅ Fine-grained reactivity
- ✅ Minimal re-renders
- ✅ TypeScript support
- ✅ SSR compatible

---

## 🔥 Svelte Adapter

Svelte 5+ adapter with runes, actions, and modern patterns.

### Svelte 5 Action (Recommended)

```svelte
<script>
  import { gracket } from 'gracket/svelte';
  
  let data = $state(tournamentData);
  
  function handleInit(instance) {
    console.log('Initialized!', instance);
  }
</script>

<div use:gracket={{ data, options: { cornerRadius: 20 }, onInit: handleInit }} />
```

### Svelte 5 Composable

```svelte
<script>
  import { createGracket } from 'gracket/svelte';
  
  let data = $state(tournamentData);
  const { containerRef, instance, updateScore } = createGracket(data);
</script>

<div bind:this={containerRef} />
```

### Svelte 4 Component (Legacy)

```svelte
<script>
  import { GracketSvelte } from 'gracket/svelte';
  
  let data = tournamentData;
</script>

<GracketSvelte {data} options={{ cornerRadius: 20 }} on:init={handleInit} />
```

**Features:**
- ✅ Svelte 5 runes support (`$state`, `$effect`)
- ✅ Action-based API (most idiomatic)
- ✅ Backward compatible with Svelte 4
- ✅ TypeScript support
- ✅ SSR compatible

---

## 🌐 Web Components Adapter

Standards-compliant custom element with Shadow DOM.

### Usage

```html
<script type="module">
  import { registerGracketElement } from 'gracket/webcomponent';
  
  // Auto-registers as <gracket-bracket>
  // Or customize: registerGracketElement('my-bracket');
  
  const bracket = document.querySelector('gracket-bracket');
  bracket.data = tournamentData;
  
  bracket.addEventListener('init', (e) => {
    console.log('Initialized!', e.detail.instance);
  });
</script>

<gracket-bracket
  corner-radius="20"
  canvas-line-color="#333"
></gracket-bracket>
```

### With Framework

Works with any framework or vanilla JS:

```typescript
import { GracketElement } from 'gracket/webcomponent';

const bracket = new GracketElement();
bracket.data = tournamentData;
bracket.options = { cornerRadius: 20 };
document.body.appendChild(bracket);
```

**Features:**
- ✅ Standards-compliant custom element
- ✅ Shadow DOM encapsulation
- ✅ Framework-agnostic
- ✅ TypeScript support
- ✅ Custom events for lifecycle hooks

---

## 🎨 Styling

All adapters use the same CSS. Import once:

```typescript
import 'gracket/style.css';
```

Or in HTML:

```html
<link rel="stylesheet" href="path/to/gracket/style.css" />
```

---

## 📖 Common API

All adapters expose these common methods:

### Component Props/Attributes

- `data` - Tournament data (required)
- `options` - Gracket configuration options
- `className`/`class` - CSS class name
- `style` - Inline styles

### Instance Methods

- `updateScore(roundIndex, gameIndex, teamIndex, score)` - Update a team's score
- `advanceRound(fromRound?)` - Advance winners to next round
- `getInstance()` - Get the underlying Gracket instance
- `destroy()` - Clean up and destroy the instance

### Events/Callbacks

- `onInit`/`init` - Fired when initialized
- `onError`/`error` - Fired on error
- `onUpdate`/`update` - Fired when data updates

---

## 🤝 TypeScript Support

All adapters are fully typed with TypeScript:

```typescript
import type { TournamentData, GracketOptions } from 'gracket';
import type { GracketReactProps } from 'gracket/react';
```

---

## 📚 Examples

Check out the `demo/` directory for complete examples with each framework.

---

## 🐛 Issues & Contributions

Found a bug or want to contribute? Visit our [GitHub repository](https://github.com/Zettersten/jquery.gracket.js).
