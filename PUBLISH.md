# Publish na-design-system to npmjs.org

## Prerequisites

1. **Create npmjs.org account** (if not already have one)
   - Go to https://www.npmjs.com/signup
   - Create account with username that matches your scope

2. **Create/verify npm organization** (for scoped package `@supriyadies-work`)
   - Go to https://www.npmjs.com/org/create
   - Create organization `supriyadies-work` (must match package scope)
   - Or join existing organization if you have access

3. **Login to npmjs.org**
   ```bash
   npm login
   ```
   - Enter your npmjs.org username, password, and email
   - If you have 2FA enabled, enter the OTP

## Publish Steps

### 1. Build the package
```bash
npm run build
```
This will:
- Build design tokens (CSS, JS, TS)
- Compile TypeScript
- Resolve path aliases
- Copy assets

### 2. Verify package contents
```bash
# Check what will be published
npm pack --dry-run

# Or preview tarball contents
npm pack
tar -tzf supriyadies-work-na-design-system-*.tgz | head -20
```

### 3. Publish to npmjs.org
```bash
# Option 1: Use the helper script
npm run publish:npm

# Option 2: Direct publish
npm publish --access public
```

**Note:** `--access public` is required for scoped packages (`@scope/package-name`) to make them publicly accessible. Without it, scoped packages are private by default.

### 4. Verify publication
```bash
# Check package on npmjs.org
open https://www.npmjs.com/package/@supriyadies-work/na-design-system

# Or via npm CLI
npm view @supriyadies-work/na-design-system
```

## Version Management

### Patch version (1.1.21 → 1.1.22)
```bash
npm run version:patch
npm run publish:npm
```

### Minor version (1.1.21 → 1.2.0)
```bash
npm run version:minor
npm run publish:npm
```

### Major version (1.1.21 → 2.0.0)
```bash
npm run version:major
npm run publish:npm
```

**Note:** Version commands will:
- Update `version` in `package.json`
- Create git tag (if in git repo)
- Commit changes (if in git repo)

## Troubleshooting

### Error: "You do not have permission to publish"
- Ensure you're logged in: `npm whoami`
- Ensure you have access to `@supriyadies-work` organization
- Check organization members: https://www.npmjs.com/org/supriyadies-work/settings/members

### Error: "Package name already exists"
- Check if package already exists: `npm view @supriyadies-work/na-design-system`
- If it exists and you own it, just update version and publish
- If it exists but you don't own it, you may need to:
  - Use a different package name
  - Request transfer from current owner

### Error: "Invalid package name"
- Ensure package name matches: `@supriyadies-work/na-design-system`
- Scope name must match npm organization name

### Error: "PrePublish script failed"
- Ensure build succeeds: `npm run build`
- Check `dist/` folder exists with compiled files
- Check all required files are included in `files` array in `package.json`

## After Publishing

1. **Update consumers** (like `na-profile`, `na-portal`)
   ```bash
   # In consumer project
   npm install @supriyadies-work/na-design-system@latest
   # or
   yarn add @supriyadies-work/na-design-system@latest
   ```

2. **Remove old registry config** (already done)
   - `.npmrc` deleted (no longer needed for npmjs.org)
   - `publishConfig` updated in `package.json`

3. **Test installation**
   ```bash
   # In a test project or consumer
   npm install @supriyadies-work/na-design-system@latest
   ```

## Package Configuration

Current configuration:
- **Registry:** npmjs.org (https://registry.npmjs.org/)
- **Access:** Public (scoped packages are private by default)
- **Files included:** `dist/`, `public/`, `README.md`
- **Build:** Auto-builds before publish (via `prepublishOnly` script)

## Notes

- Package is now published to **npmjs.org**, not GitHub Packages
- No authentication token needed for publishing (only npm login)
- Consumers can install without any registry config
- Version 1.1.21 is ready to publish

