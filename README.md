# @supriyadies-work/na-design-system

Design system package for **Nisa Aulia Portfolio** — design tokens, React components, and theme scales (nisaaulia / supriyadies).

**Documentation & visual reference:** [nisaaulia.com/design-pattern](https://nisaaulia.com/design-pattern)

We’re open to feedback and improvements. Suggestions, issues, and pull requests are welcome.

---

## Installation

```bash
npm install @supriyadies-work/na-design-system
# or
yarn add @supriyadies-work/na-design-system
```

### Peer dependencies

Ensure these are installed in your project:

- `react` ^18.0.0
- `react-dom` ^18.0.0
- `next` ^14.0.0 (if using Next.js)
- `next-themes` ^0.4.0 (for theming)
- `lottie-react` ^2.4.0 (for Lottie animations)

---

## Usage

### Components

```tsx
import { Button, Card, ScaleProvider } from "@supriyadies-work/na-design-system";

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
import { Button } from "@supriyadies-work/na-design-system/components/Button";
```

### Tokens (JS)

```tsx
import { tokens, getToken, getCSSVar, theme } from "@supriyadies-work/na-design-system";
// or
import { tokens } from "@supriyadies-work/na-design-system/js/tokens";
```

### Tokens (CSS)

In your global CSS or layout:

```css
@import "@supriyadies-work/na-design-system/css";
```

For scale-specific variables (per brand):

```css
@import "@supriyadies-work/na-design-system/css/scale";
```

### Utilities

```tsx
import { cn, useScale, getScaleConfig } from "@supriyadies-work/na-design-system";
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

Two theme scales are supported:

- **nisaaulia** — default
- **supriyadies**

Use `ScaleProvider` and `defaultScale` to choose a scale; components and tokens follow the active scale.

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
