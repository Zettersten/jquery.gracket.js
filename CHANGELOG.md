# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-10-30

### Added
- Complete rewrite in TypeScript
- Framework-agnostic core library
- React adapter component (`gracket/react`)
- Vue 3 adapter component (`gracket/vue`)
- Comprehensive test suite with Vitest
- Modern build system using Vite
- ES modules and UMD builds
- Full TypeScript type definitions
- GitHub Actions for CI/CD
- Automated NPM publishing workflow
- GitHub Pages deployment for demos
- Modern, responsive demo page
- Comprehensive documentation

### Changed
- **BREAKING**: Removed jQuery dependency
- **BREAKING**: Changed from jQuery plugin to ES module
- **BREAKING**: Updated API to use constructor pattern instead of jQuery plugin
- Modernized CSS with better responsive design
- Improved hover interactions and animations
- Better accessibility support
- Optimized canvas rendering

### Removed
- jQuery dependency (now pure JavaScript)
- Old jQuery plugin API (replaced with modern API)

### Migration Guide
See README.md for migration instructions from v1.x to v2.x

## [1.5.5] - 2012

### Initial jQuery plugin release
- jQuery-based tournament bracket plugin
- Canvas-based line rendering
- Basic customization options
- Support for single elimination brackets
