# GitHub Pages Setup Guide

This guide will help you set up GitHub Pages to deploy the Gracket demo site automatically.

## 🚀 Quick Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Save the settings

That's it! The deployment workflow is already configured.

## 📋 What Happens Automatically

When you push to the `main` branch:

1. **CI Workflow** runs (`ci.yml`)
   - Runs tests
   - Lints code
   - Builds library

2. **Deploy Workflow** runs (`deploy.yml`)
   - Builds the library
   - Builds the demo site
   - Deploys to GitHub Pages

## 🔍 Workflow Details

### Deploy Workflow (`.github/workflows/deploy.yml`)

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:  # Allows manual triggering
```

**Triggers:**
- Automatic on push to `main` branch
- Manual via "Actions" tab → "Deploy to GitHub Pages" → "Run workflow"

**What it builds:**
1. Library (`npm run build`) → Creates `dist/` folder
2. Demo site (`npm run build:demo`) → Creates `dist-demo/` folder
3. Deploys `dist-demo/` to GitHub Pages

## 🌐 Accessing Your Demo

After successful deployment, your demo will be available at:

```
https://<username>.github.io/<repository-name>/
```

For this repo:
```
https://zettersten.github.io/jquery.gracket.js/
```

## 🔧 Manual Deployment

### Option 1: Via GitHub UI

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

### Option 2: Via Git Push

```bash
git add .
git commit -m "Update demo"
git push origin main
```

The deployment will start automatically.

## 🛠️ Local Testing

### Test the Demo Locally

```bash
# Start development server
npm run dev

# Opens at http://localhost:5173
```

### Build and Preview Demo Locally

```bash
# Build demo
npm run build:demo

# Preview the built demo
npm run preview

# Opens at http://localhost:4173
```

## 📦 Build Scripts Explained

### `npm run build`
Builds the library for NPM distribution:
- Output: `dist/` folder
- Formats: ES module, UMD, TypeScript types
- Used by: NPM package consumers

### `npm run build:demo`
Builds the demo site for GitHub Pages:
- Output: `dist-demo/` folder
- Format: Static HTML/CSS/JS
- Used by: GitHub Pages deployment

### `npm run dev`
Starts development server:
- Serves demo from `demo/` folder
- Hot module reloading enabled
- Used for: Local development

## 🐛 Troubleshooting

### Demo Site Not Updating

1. **Check Workflow Status**
   - Go to **Actions** tab
   - Look for failed workflows (red ❌)
   - Click on failed workflow to see error logs

2. **Common Issues:**

   **Build fails:**
   ```bash
   # Locally test build
   npm run build:demo
   ```

   **TypeScript errors:**
   ```bash
   # Check for errors
   npm run lint
   ```

   **Missing dependencies:**
   ```bash
   # Reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Clear GitHub Pages Cache**
   - Go to Settings → Pages
   - Change source to "None", save
   - Change back to "GitHub Actions", save

### Deployment Succeeds But Site Shows 404

This usually means the build output is in wrong location.

**Check:**
1. Workflow logs show files in `dist-demo/`
2. `vite.config.ts` has correct `outDir`
3. `.github/workflows/deploy.yml` uploads correct path

**Verify locally:**
```bash
npm run build:demo
ls -la dist-demo/
# Should show index.html and assets/
```

### Assets Not Loading (404 errors in console)

If you see 404 errors for CSS/JS files:

1. Check browser console (F12)
2. Look for asset paths
3. Update `vite.config.ts` base path if needed:

```typescript
export default defineConfig({
  base: '/jquery.gracket.js/',  // Your repo name
  // ...
});
```

## 📊 Monitoring Deployments

### View Deployment Status

1. **Actions Tab** - See all workflow runs
2. **Environments** - Click "github-pages" to see deployments
3. **Settings → Pages** - Shows current deployment URL

### Deployment Times

- **CI + Deploy:** ~3-5 minutes
- **Deploy only:** ~2-3 minutes

## 🔒 Permissions

The workflow requires these permissions (already configured):

```yaml
permissions:
  contents: read    # Read repository
  pages: write      # Deploy to Pages
  id-token: write   # OIDC token
```

## 🎨 Customizing the Demo

### Update Demo Content

1. Edit `demo/index.html` for structure
2. Edit `src/demo.ts` for functionality
3. Edit `src/style.css` for default bracket styles
4. Push changes to `main` branch

### Add Custom Styles

Add a `<style>` block in `demo/index.html`:

```html
<style>
  .g_team {
    background: your-color !important;
  }
</style>
```

## 📝 Demo Features

Your GitHub Pages demo includes:

✅ **Interactive Bracket** - Live tournament visualization  
✅ **Multiple Examples** - 4-team and 16-team brackets  
✅ **Code Samples** - Vanilla JS, React, Vue, CDN  
✅ **Interactive Controls** - Update scores, change styles  
✅ **Hover Effects** - Team highlighting across rounds  
✅ **Responsive Design** - Works on all devices  
✅ **Fast Loading** - Optimized build with Vite  

## 🔄 Update Workflow

**To update the demo:**

```bash
# 1. Make changes
edit demo/index.html
edit src/demo.ts

# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Update demo"
git push

# 4. Wait 3-5 minutes for deployment
# 5. Visit https://zettersten.github.io/jquery.gracket.js/
```

## 🎯 Next Steps

- ✅ Demo is automatically deployed
- ✅ Updates on every push to main
- ✅ Available at GitHub Pages URL
- 📝 Share the URL with users
- 🌟 Encourage GitHub stars
- 📦 Ready for NPM publication

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

---

Need help? Open an issue on GitHub!
