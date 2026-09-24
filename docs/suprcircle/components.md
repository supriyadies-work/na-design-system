# SuprCircle component contract (platform-neutral)

This is a **contract**, not an instruction to port React components to Flutter. Product widgets live in `suprcircle-mobile` and must consume semantic tokens only.

Color reinforces state; grayscale must still communicate meaning via icon/glyph, label, and emphasis/position.

## Button

- Variants: primary, secondary, tonal, text
- States: default, pressed, focused, disabled, loading
- Primary maps to `action.primary.*`; secondary to `action.secondary.*`
- Min height: CTA `46` (compact `39–40`); min touch `44`

## Input

- States: empty, focused, populated, disabled, error, read-only
- Outline: `outline.default` / focus uses primary action green
- Error uses `feedback.attention.*`

## Card

- Variants: standard, elevated, informational, status
- Radius: standard `10`; member `11`
- Padding: `13` (compact `12`, roomy `20`)
- Elevation: card / subtle shadow tokens

## Chip / badge

- Variants: neutral, active/success, information, attention
- Radius: `14`
- May include leading icon + text
- Success → `action.primary.container` + `onContainer`

## Avatar

- Variants: image, initials, verified badge
- Verified badge uses success/primary greens

## Information / list row

- Structure: icon, label, value, supporting text, trailing action
- Icon sits on soft mint / blue surfaces from primitives as needed

## Navigation item

- States: inactive / active
- Active label/icon: `navigation.active` (`#004936`)
- Must expose semantic selection (not color alone)

## Feedback

- loading, empty, error, offline, permission/role restricted
- Map containers to `feedback.*` semantics

## Admin foundations

- sidebar item, table header/cell, pagination, filter/search field
- Prefer existing web DS patterns for admin; SuprCircle mobile remains consumer of semantics above
