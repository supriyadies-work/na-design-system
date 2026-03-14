# @supriyadies-work/supr-design-system

Design system package — design tokens, React components, and theme scales (nisaaulia / supriyadies / weddio / wedwise). Scalable per-brand theming with optional runtime assets (fonts, IcoMoon icons, tokens).

**Documentation & visual reference:** [nisaaulia.com/design-pattern](https://nisaaulia.com/design-pattern)

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
- **supriyadies** — larger spacing/typography
- **weddio** — per-scale color palette (and optional font/icon set) for Weddio (uses Wedwise token prefix for backward compatibility)
- **wedwise** — legacy alias for Weddio scale (kept for backward compatibility)

Use `ScaleProvider` and `defaultScale` to choose a scale. For scalable theming (different fonts, colors, or icon set per brand), pass `fontsManifestUrl`, `iconSelectionUrl`, and/or `tokensUrl` so the design system loads your assets at runtime.

---

## Development scripts

```bash
npm run build          # Full build (tokens + compile + assets + docs)
npm run build:watch    # Watch tokens
npm run build:tokens   # Style Dictionary only
npm run build:docs     # Generate docs metadata
```

---

## References

- **Design patterns & docs:** [nisaaulia.com/design-pattern](https://nisaaulia.com/design-pattern)
- **Repository:** [github.com/supriyadies-work/na-design-system](https://github.com/supriyadies-work/na-design-system)
