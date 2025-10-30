# 🚀 Deployment Checklist

Use this checklist before deploying your modernized Gracket library to ensure everything is ready.

## ✅ Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Code is formatted: `npm run format`
- [ ] TypeScript compiles: `npm run build:types`
- [ ] Library builds successfully: `npm run build`
- [ ] Demo builds successfully: `npm run build:demo`

### 2. Documentation

- [ ] README.md is up to date
- [ ] CHANGELOG.md has version entry
- [ ] All examples work correctly
- [ ] Migration guide is complete
- [ ] API documentation is accurate

### 3. Package Configuration

- [ ] `package.json` version is correct
- [ ] `package.json` repository URL is correct
- [ ] `package.json` author and license are set
- [ ] Package exports are configured
- [ ] Keywords are relevant and complete

### 4. GitHub Repository

- [ ] Repository is public (or configured for private publishing)
- [ ] LICENSE file is present
- [ ] .gitignore excludes build artifacts
- [ ] All files are committed
- [ ] No sensitive information in code

### 5. GitHub Pages

- [ ] GitHub Pages is enabled in repo settings
- [ ] Source is set to "GitHub Actions"
- [ ] Demo site builds locally: `npm run build:demo && npm run preview`
- [ ] All interactive features work in demo
- [ ] Links in demo point to correct URLs

### 6. NPM Publishing

- [ ] NPM account is set up
- [ ] You're logged in: `npm whoami`
- [ ] Package name is available: `npm view gracket`
- [ ] `.npmignore` is configured
- [ ] Only necessary files will be published

### 7. GitHub Actions

- [ ] Workflows are present in `.github/workflows/`
- [ ] CI workflow runs successfully
- [ ] Deploy workflow is configured
- [ ] Publish workflow is ready (but not run yet)

## 🎯 Deployment Steps

### Step 1: Final Testing

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run all checks
npm test
npm run lint
npm run build
npm run build:demo

# Test demo locally
npm run preview
```

### Step 2: Update Version

```bash
# Choose one:
npm version patch  # Bug fixes (1.0.0 → 1.0.1)
npm version minor  # New features (1.0.0 → 1.1.0)
npm version major  # Breaking changes (1.0.0 → 2.0.0)
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag

### Step 3: Update Changelog

Edit `CHANGELOG.md`:

```markdown
## [2.0.0] - 2024-10-30

### Added
- Complete TypeScript rewrite
- React and Vue adapters
- Comprehensive test suite
- Modern build system

### Changed
- Removed jQuery dependency
- New class-based API

### Breaking Changes
- No longer a jQuery plugin
```

Commit the changelog:

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for v2.0.0"
```

### Step 4: Push to GitHub

```bash
# Push commits
git push origin main

# Push tags
git push origin --tags
```

This will trigger:
- ✅ CI workflow (tests, lint, build)
- ✅ Deploy workflow (GitHub Pages)

### Step 5: Create GitHub Release

1. Go to repository on GitHub
2. Click **Releases** → **Create a new release**
3. Select the version tag (e.g., `v2.0.0`)
4. Title: `v2.0.0 - Modern TypeScript Rewrite`
5. Description: Copy from CHANGELOG.md
6. Attach build artifacts (optional)
7. Click **Publish release**

This will trigger:
- ✅ Publish workflow (NPM)

### Step 6: Verify Deployment

**GitHub Pages:**
- Visit: `https://zettersten.github.io/jquery.gracket.js/`
- Check all features work
- Test on mobile

**NPM Package:**
- Check: `https://www.npmjs.com/package/gracket`
- Wait 5-10 minutes for propagation
- Test install: `npm install gracket@latest`

## 🔍 Post-Deployment Checks

### Verify GitHub Pages

- [ ] Demo site is live
- [ ] All interactive features work
- [ ] No console errors (F12)
- [ ] Assets load correctly
- [ ] Mobile responsive
- [ ] Links work

### Verify NPM Package

```bash
# In a test directory
mkdir test-gracket
cd test-gracket
npm init -y
npm install gracket

# Check files
ls node_modules/gracket/

# Should contain:
# - dist/
# - README.md
# - LICENSE
# - package.json
```

Test vanilla JS:
```javascript
import { Gracket } from 'gracket';
console.log(Gracket); // Should show class
```

Test TypeScript:
```typescript
import { Gracket, TournamentData } from 'gracket';
// Should have autocomplete and types
```

### Verify CI/CD

- [ ] All GitHub Actions passed
- [ ] No failed workflows in Actions tab
- [ ] Deploy workflow shows successful deployment
- [ ] Publish workflow completed

## 🐛 Rollback Plan

If something goes wrong:

### Unpublish from NPM (within 72 hours)

```bash
npm unpublish gracket@2.0.0
```

⚠️ **Warning:** This is permanent and can only be done within 72 hours

### Deprecate a Version

```bash
npm deprecate gracket@2.0.0 "This version has issues, use 2.0.1 instead"
```

### Fix and Republish

1. Fix the issue
2. Increment version: `npm version patch`
3. Update CHANGELOG.md
4. Push and create new release

## 📊 Success Metrics

After 24 hours, check:

- [ ] NPM downloads: `npm info gracket`
- [ ] GitHub stars increased
- [ ] No critical issues reported
- [ ] Demo site has visitors (GitHub Insights)

## 🎉 Announcement

After successful deployment, announce on:

- [ ] GitHub repository (pin a discussion/issue)
- [ ] NPM package page (ensure README is good)
- [ ] Social media (Twitter, LinkedIn, etc.)
- [ ] Dev.to or Medium blog post
- [ ] Reddit r/javascript or r/webdev
- [ ] Your personal website/blog

### Sample Announcement

```markdown
🎉 Gracket v2.0 is now live!

Modern, framework-agnostic tournament bracket library:
- ✅ Zero dependencies (no jQuery!)
- ✅ Full TypeScript support
- ✅ React & Vue adapters
- ✅ 30+ comprehensive tests
- ✅ Modern build system

📦 npm install gracket
🌐 https://zettersten.github.io/jquery.gracket.js/
📖 https://github.com/erik5388/jquery.gracket.js

Try it out and let me know what you think! ⭐
```

## 📝 Notes

- **Version numbering**: Follow [Semantic Versioning](https://semver.org/)
- **NPM tokens**: Store in GitHub secrets as `NPM_TOKEN`
- **Build times**: Usually 3-5 minutes for full deployment
- **Caching**: NPM/CDN caches may take 10-15 minutes to update

---

**Ready to deploy?** Go through this checklist and ensure everything is ✅ before proceeding!
