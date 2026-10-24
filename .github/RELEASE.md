# Release Process

This document describes how to publish a new version of `@mierune/maplibre-gl-manual-geolocate` to npm.

## Prerequisites

### One-time Setup: npm Trusted Publishing (OIDC)

Publishing uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers), so no npm token or PAT is required.

1. Go to https://www.npmjs.com/package/@mierune/maplibre-gl-manual-geolocate/access
2. Under "Trusted Publisher", select "GitHub Actions" and enter:
   - Organization or user: `MIERUNE`
   - Repository: `maplibre-gl-manual-geolocate`
   - Workflow filename: `publish.yml`
   - Environment name: `npm`
3. Save. Optionally set "Publishing access" to "Require two-factor authentication and disallow tokens".

## Publishing a New Release

### 1. Bump the Version

Open a PR that updates `version` in `package.json` (e.g., `pnpm version 0.2.0 --no-git-tag-version`) and merge it into main.

### 2. Create GitHub Release

1. Go to https://github.com/MIERUNE/maplibre-gl-manual-geolocate/releases/new
2. Click "Choose a tag" and type the new version with `v` prefix (e.g., `v0.2.0`), targeting main
   - ⚠️ **Important:** Tag must start with `v` and match `package.json` (e.g., `v0.2.0` for `0.2.0`)
3. Set the release title (e.g., `v0.2.0`)
4. Add release notes describing changes
5. Click "Publish release"

The GitHub Action will automatically:
- ✅ Verify the tag matches `package.json` version
- ✅ Build the library
- ✅ Run tests
- ✅ Publish to npm with provenance

You can monitor progress at:
https://github.com/MIERUNE/maplibre-gl-manual-geolocate/actions

### 3. Verify Publication

After the action completes, verify the new version is live:
- npm: https://www.npmjs.com/package/@mierune/maplibre-gl-manual-geolocate
- Or run: `npm view @mierune/maplibre-gl-manual-geolocate version`

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes, documentation updates
- **Minor** (0.1.0 → 0.2.0): New features (backwards compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

## Troubleshooting

### Action fails with "404 Not Found" / "401 Unauthorized" on publish
- Check the Trusted Publisher settings on npmjs.com (workflow filename `publish.yml`, environment `npm`)

### Action fails with "Tag ... does not match package.json version"
- Bump `package.json` on main first, then delete and recreate the release/tag

### Action fails with "Version already exists"
- The version from the tag already exists on npm
- Create a new release with a higher version number

### Tests fail
- Fix the failing tests before creating the release
- The workflow will not publish if tests fail
