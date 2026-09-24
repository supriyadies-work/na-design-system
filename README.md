# @supriyadies-work/supr-design-system

Design system package — design tokens, React components, and theme scales (`nisaaulia` / `supriyadies` / `weddio` / `wedwise` / **`suprcircle`**). Scalable per-brand theming with optional runtime assets (fonts, IcoMoon icons, tokens).

**SuprCircle** is a **brand profile** (identity tokens + Flutter theme package), not an alias of the `supriyadies` 1.25 density multiplier. Flutter consumers: [`packages/supr_design_system_flutter`](packages/supr_design_system_flutter/README.md).

**Documentation & visual reference:** [nisaaulia.com/design-pattern](https://nisaaulia.com/design-pattern) · SuprCircle normalization: [`docs/suprcircle/figma-normalization.md`](docs/suprcircle/figma-normalization.md)

We’re open to feedback and improvements. Suggestions, issues, and pull requests are welcome.

---

## Installation

```bash
npm install @supriyadies-work/supr-design-system
# or
yarn add @supriyadies-work/supr-design-system
```

### Peer dependencies

Ensure these are installed in your project:

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `next` ^14.0.0 (if using Next.js)
- `next-themes` ^0.4.0 (for theming)
- `lottie-react` ^2.4.0 (for Lottie animations)

### Setelah install (optional, for scalable theming)

To use per-brand theming with your own tokens, fonts, and icons:

1. **Generate example files** in your project:
   ```bash
   npx @supriyadies-work/supr-design-system init
   ```
   This creates `theme.json`, `fonts.json`, and `icons/selection.json` (e.g. under `src/assets`).

2. **Add your assets:** Edit the generated files, add font files under `fonts/`, and optionally export your icon set from [IcoMoon](https://icomoon.io) and replace `icons/selection.json`.

3. **Configure ScaleProvider** with the URLs your app serves these from:
   - `assetBaseUrl` — base URL for assets
   - `tokensUrl` — URL to your theme/tokens JSON
   - `fontsManifestUrl` — URL to `fonts.json`
   - `iconSelectionUrl` — URL to IcoMoon `selection.json`

4. See the full guide in this README (Scales, runtime assets) and the repository for more details.

---

## Usage

### Components

```tsx
import { Button, Card, ScaleProvider } from "@supriyadies-work/supr-design-system";

// Default scale: nisaaulia
<ScaleProvider>
  <Button>Primary</Button>
  <Card>...</Card>
</ScaleProvider>

// Scale: supriyadies
<ScaleProvider defaultScale="supriyadies">
  <App />
</ScaleProvider>
```

Per-component imports (better tree-shaking):

```tsx
import { Button } from "@supriyadies-work/supr-design-system/components/Button";
```

### Toast notifications (non-blocking)

Use `ToastProvider` once near the root of your app, then call `pushToast` anywhere via `useToast`.

```tsx
"use client";

import { ToastProvider, useToast } from "@supriyadies-work/supr-design-system/components/molecules";

function SaveButton() {
  const { pushToast } = useToast();
  return (
    <button
      onClick={() => pushToast({ message: "Draft tersimpan", variant: "success" })}
    >
      Save
    </button>
  );
}

export default function AppRoot({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

- Default behavior: top-right, auto-hide in 5 seconds, dismiss via close button or swipe.

### Tokens (JS)

```tsx
import { tokens, getToken, getCSSVar, theme } from "@supriyadies-work/supr-design-system";
// or
import { tokens } from "@supriyadies-work/supr-design-system/js/tokens";
```

### Tokens (CSS)

In your global CSS or layout:

```css
@import "@supriyadies-work/supr-design-system/css";
```

For scale-specific variables (per brand):

```css
@import "@supriyadies-work/supr-design-system/css/scale";
```

### Utilities

```tsx
import { cn, useScale, getScaleConfig } from "@supriyadies-work/supr-design-system";
```

---

## Package exports

| Export | Description |
|--------|-------------|
| `.` | All components, tokens, utils, and scale |
| `./components` | Component index |
| `./components/*` | Single component (e.g. `Button`, `Card`) |
| `./tokens` | Token object (JS) |
| `./js/tokens` | Same, alternate path |
| `./css` | CSS variables (`tokens.css`) |
| `./css/scale` | Scale CSS (nisaaulia / supriyadies) |
| `./utils` | `cn`, validation, etc. |
| `./docs` | Documentation metadata (JSON) |

---

## Scales (brands)

Theme scales supported:

- **nisaaulia** — default
- **supriyadies** — larger spacing/typography (density multiplier 1.25)
- **weddio** — per-scale color palette (and optional font/icon set) for Weddio (uses Wedwise token prefix for backward compatibility)
- **wedwise** — legacy alias for Weddio scale (kept for backward compatibility)
- **suprcircle** — brand profile (multiplier 1); Flutter theme package under `packages/supr_design_system_flutter` — **not** an alias of `supriyadies`

Use `ScaleProvider` and `defaultScale` to choose a scale. For scalable theming (different fonts, colors, or icon set per brand), pass `fontsManifestUrl`, `iconSelectionUrl`, and/or `tokensUrl` so the design system loads your assets at runtime.

### SuprCircle / Flutter

```bash
npm run build:flutter-tokens   # Generate Dart tokens
npm run check:flutter-tokens   # Fail if generated files drift
npm run test:flutter-package   # format + analyze + test
npm run validate:suprcircle    # web tokens + flutter gates
```

Pin Flutter consumers to a Git tag + `path: packages/supr_design_system_flutter` (see package README). Light theme only until dark is designed.

---

## Development scripts

```bash
npm run build          # Full build (tokens + flutter tokens + compile + assets + docs)
npm run build:watch    # Watch tokens
npm run build:tokens   # Style Dictionary (web) only
npm run build:flutter-tokens
npm run build:docs     # Generate docs metadata
```

---

## References

- **Design patterns & docs:** [nisaaulia.com/design-pattern](https://nisaaulia.com/design-pattern)
- **Repository:** [github.com/supriyadies-work/supr-design-system](https://github.com/supriyadies-work/supr-design-system)
