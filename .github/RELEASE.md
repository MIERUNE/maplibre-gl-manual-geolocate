# Release Process

This document describes how to publish a new version of `@mierune/maplibre-gl-manual-geolocate` to npm.

## Prerequisites

### One-time Setup: NPM Token

1. **Generate an npm access token:**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token" → "Classic Token"
   - Select "Automation" type (for CI/CD publishing)
   - Copy the token (starts with `npm_...`)

2. **Add token to GitHub:**
   - Go to https://github.com/MIERUNE/maplibre-gl-manual-geolocate/settings/secrets/actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

## Publishing a New Release

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "0.2.0"  // Change from 0.1.0 to your new version
}
```

Commit and push to main:

```bash
git add package.json
git commit -m "chore: bump version to 0.2.0"
git push origin main
```

### 2. Create GitHub Release

1. Go to https://github.com/MIERUNE/maplibre-gl-manual-geolocate/releases/new
2. Click "Choose a tag" and type the new version (e.g., `v0.2.0`)
3. Click "Create new tag: v0.2.0 on publish"
4. Set the release title (e.g., `v0.2.0`)
5. Add release notes describing changes
6. Click "Publish release"

### 3. Automatic Publishing

The GitHub Action will automatically:
- ✅ Build the library
- ✅ Run tests
- ✅ Publish to npm

You can monitor progress at:
https://github.com/MIERUNE/maplibre-gl-manual-geolocate/actions

### 4. Verify Publication

After the action completes, verify the new version is live:
- npm: https://www.npmjs.com/package/@mierune/maplibre-gl-manual-geolocate
- Or run: `npm view @mierune/maplibre-gl-manual-geolocate version`

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes, documentation updates
- **Minor** (0.1.0 → 0.2.0): New features (backwards compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

## Troubleshooting

### Action fails with "401 Unauthorized"
- Check that `NPM_TOKEN` secret is set correctly
- Verify the token hasn't expired
- Ensure the token has "Automation" permissions

### Action fails with "Version already exists"
- Make sure you bumped the version in `package.json`
- Check that the git tag matches the package.json version

### Tests fail
- Fix the failing tests before creating the release
- The workflow will not publish if tests fail
