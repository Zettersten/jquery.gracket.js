# Contributing to Gracket

First off, thank you for considering contributing to Gracket! It's people like you that make Gracket such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (browser, OS, version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the enhancement**
* **Describe the current behavior and the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the TypeScript styleguide
* Include tests when adding features
* Update documentation for API changes
* End all files with a newline
* Follow the existing code style

## Development Process

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Add tests** for your changes
5. **Run tests**: `npm test`
6. **Run linter**: `npm run lint`
7. **Build**: `npm run build`
8. **Commit your changes** with a clear commit message
9. **Push to your fork** and submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/jquery.gracket.js.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

### Project Structure

```
gracket/
├── src/
│   ├── core/           # Core library
│   ├── adapters/       # Framework adapters
│   ├── types.ts        # TypeScript type definitions
│   └── style.css       # Default styles
├── demo/               # Demo application
├── tests/              # Test files
└── dist/               # Build output (generated)
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Examples:
```
feat: add support for double elimination brackets
fix: resolve canvas rendering issue on Safari
docs: update React examples in README
test: add tests for hover interactions
refactor: simplify bracket rendering logic
```

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow existing code style (enforced by ESLint)
* Use meaningful variable names
* Add JSDoc comments for public APIs
* Prefer const over let
* Use arrow functions where appropriate
* Avoid `any` types when possible

### Testing

* Write tests for all new features
* Maintain or improve code coverage
* Use descriptive test names
* Group related tests with `describe` blocks
* Use `beforeEach` and `afterEach` for setup/teardown

Example:
```typescript
describe('Gracket', () => {
  describe('initialization', () => {
    it('should create bracket with provided data', () => {
      // Test implementation
    });
  });
});
```

## Release Process

Releases are automated through GitHub Actions:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes: `git commit -m "chore: release v2.x.x"`
4. Create tag: `git tag v2.x.x`
5. Push: `git push && git push --tags`
6. Create GitHub release
7. GitHub Actions will automatically publish to NPM

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## Recognition

Contributors will be recognized in the README and release notes.

Thank you for contributing! 🎉
