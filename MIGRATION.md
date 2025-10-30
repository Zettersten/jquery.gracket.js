# Migration Guide: v1.x to v2.0

This guide will help you migrate from the jQuery-based Gracket v1.x to the modern v2.0.

## Overview of Changes

Gracket v2.0 is a complete rewrite with the following improvements:

- ✅ **No jQuery dependency** - Pure modern JavaScript
- ✅ **TypeScript support** - Full type definitions
- ✅ **Framework adapters** - React, Vue, and more
- ✅ **ES Modules** - Tree-shakable and modern
- ✅ **Better performance** - Optimized rendering
- ✅ **Improved API** - Cleaner, more intuitive

## Breaking Changes

### 1. No jQuery Required

**Before (v1.x):**
```html
<script src="jquery.js"></script>
<script src="jquery.gracket.js"></script>
<script>
  $('#bracket').gracket({ src: data });
</script>
```

**After (v2.x):**
```html
<script type="module">
  import { Gracket } from 'gracket';
  new Gracket('#bracket', { src: data });
</script>
```

### 2. Installation

**Before (v1.x):**
```bash
# Download files manually or via CDN
```

**After (v2.x):**
```bash
npm install gracket
# or
yarn add gracket
```

### 3. API Changes

#### Initialization

**Before (v1.x):**
```javascript
$('#bracket').gracket({
  src: data,
  cornerRadius: 15,
  canvasLineColor: '#eee'
});
```

**After (v2.x):**
```javascript
import { Gracket } from 'gracket';
import 'gracket/style.css';

const bracket = new Gracket('#bracket', {
  src: data,
  cornerRadius: 15,
  canvasLineColor: '#eee'
});
```

#### Updating Data

**Before (v1.x):**
```javascript
// Not available in v1.x - had to destroy and recreate
$('#bracket').empty();
$('#bracket').gracket({ src: newData });
```

**After (v2.x):**
```javascript
bracket.update(newData);
```

#### Cleanup

**Before (v1.x):**
```javascript
$('#bracket').empty();
```

**After (v2.x):**
```javascript
bracket.destroy();
```

## CSS Changes

The CSS class names remain the same, but you now need to import the stylesheet:

```javascript
import 'gracket/style.css';
```

Or link it in HTML:
```html
<link rel="stylesheet" href="node_modules/gracket/dist/style.css">
```

## Framework Integration

### React

```tsx
import { GracketReact } from 'gracket/react';
import 'gracket/style.css';

function MyComponent() {
  return <GracketReact data={tournamentData} cornerRadius={15} />;
}
```

### Vue 3

```vue
<script setup>
import { GracketVue } from 'gracket/vue';
import 'gracket/style.css';

const data = ref(tournamentData);
</script>

<template>
  <GracketVue :data="data" :options="{ cornerRadius: 15 }" />
</template>
```

## Data Structure

The data structure remains **completely compatible** with v1.x:

```javascript
const data = [
  [
    [
      { name: 'Team A', seed: 1, score: 100 },
      { name: 'Team B', seed: 2, score: 85 }
    ]
  ],
  // ... more rounds
];
```

## Configuration Options

All v1.x options are supported in v2.x with the same names:

| Option | v1.x | v2.x | Notes |
|--------|------|------|-------|
| `src` | ✅ | ✅ | Same |
| `gracketClass` | ✅ | ✅ | Same |
| `gameClass` | ✅ | ✅ | Same |
| `roundClass` | ✅ | ✅ | Same |
| `teamClass` | ✅ | ✅ | Same |
| `winnerClass` | ✅ | ✅ | Same |
| `cornerRadius` | ✅ | ✅ | Same |
| `canvasLineColor` | ✅ | ✅ | Same |
| `canvasLineWidth` | ✅ | ✅ | Same |
| `canvasLineGap` | ✅ | ✅ | Same |
| `roundLabels` | ✅ | ✅ | Same |

## Step-by-Step Migration

### 1. Install the Package

```bash
npm install gracket
```

### 2. Update Your HTML

Remove jQuery and old script tags:

```diff
- <script src="jquery.js"></script>
- <script src="jquery.gracket.js"></script>
+ <script type="module" src="app.js"></script>
```

### 3. Update Your JavaScript

Convert from jQuery plugin to ES module:

```diff
- $('#bracket').gracket({
-   src: data,
-   cornerRadius: 15
- });

+ import { Gracket } from 'gracket';
+ import 'gracket/style.css';
+ 
+ const bracket = new Gracket('#bracket', {
+   src: data,
+   cornerRadius: 15
+ });
```

### 4. Update Your CSS

Import the stylesheet:

```javascript
import 'gracket/style.css';
```

Or use a link tag:

```html
<link rel="stylesheet" href="node_modules/gracket/dist/style.css">
```

### 5. Test Your Application

Run your application and verify that the bracket renders correctly.

## Benefits of Upgrading

1. **Smaller Bundle Size** - No jQuery dependency (~30KB savings)
2. **Better Performance** - Modern JavaScript optimizations
3. **Type Safety** - Full TypeScript support
4. **Framework Integration** - First-class React/Vue support
5. **Better Maintenance** - Active development and updates
6. **Modern Tooling** - ES modules, tree-shaking, etc.

## Need Help?

- Check the [README](README.md) for complete documentation
- Review the [examples](demo/) for working code
- Open an [issue](https://github.com/erik5388/jquery.gracket.js/issues) if you encounter problems

## Backwards Compatibility Note

If you need to maintain jQuery compatibility temporarily, you can create a simple adapter:

```javascript
import { Gracket } from 'gracket';

$.fn.gracket = function(options) {
  return this.each(function() {
    new Gracket(this, options);
  });
};
```

This allows you to gradually migrate your codebase.
