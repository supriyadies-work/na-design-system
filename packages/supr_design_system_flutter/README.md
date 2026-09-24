# SuprCircle Flutter design system

Typed SuprCircle tokens, `ThemeExtension`s, and a production-ready **light** `ThemeData`.

This package is the Flutter surface of `@supriyadies-work/supr-design-system`. It does **not** ship product screens or business-domain widgets — those belong in `suprcircle-mobile`.

## Consume via Git

```yaml
dependencies:
  supr_design_system_flutter:
    git:
      url: git@github.com:supriyadies-work/na-design-system.git
      ref: <immutable-reviewed-tag>
      path: packages/supr_design_system_flutter
```

## Usage

```dart
import 'package:supr_design_system_flutter/supr_design_system_flutter.dart';

MaterialApp.router(
  theme: SuprCircleTheme.light(),
  themeMode: ThemeMode.light, // dark is not designed yet
  themeAnimationStyle: AnimationStyle.noAnimation,
  routerConfig: router,
);
```

Read semantic roles in widgets:

```dart
final colors = SuprColors.of(context);
final spacing = SuprSpacing.of(context);
final typography = SuprTypography.of(context);
final shapes = SuprShapes.of(context);
final motion = SuprMotion.of(context);
```

## Brand vs scale

`suprcircle` is a **brand profile**, not an alias of the web `supriyadies` 1.25 density multiplier. Flutter spacing/radii/type sizes are absolute logical pixels from Figma — no global multiplication.

## Source of truth

Figma → `src/tokens/primitives|brands/suprcircle` → Style Dictionary → `lib/src/generated/` + hand-authored `SuprCircleTheme.light()`.

Regenerate:

```bash
# from repo root
npm run build:flutter-tokens
npm run check:flutter-tokens
```

## Theme mode

**Light only.** Dark mode is documented as future designed work — do not invent an inverted palette.

## Fonts

Lato (OFL) is bundled under `assets/fonts/`. See `THIRD_PARTY_NOTICES.md` and `assets/fonts/CHECKSUMS.sha256`. No `google_fonts`, no runtime font fetch.

## Adding a token

1. Edit JSON under `src/tokens/primitives/suprcircle` or `src/tokens/brands/suprcircle`.
2. Run `npm run build:flutter-tokens`.
3. Wire semantic roles into ThemeExtensions / `SuprCircleTheme.light()` if needed.
4. Never add raw hex/font sizes in app feature code.

## Validate

```bash
dart format --output=none --set-exit-if-changed .
flutter analyze
flutter test
```
