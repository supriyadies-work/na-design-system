# SuprCircle Figma normalization

Canonical file: [SuprCircle](https://www.figma.com/design/QPLaiEPSROtHKENvfPD7uI/SuprCircle?node-id=0-1) (`fileKey=QPLaiEPSROtHKENvfPD7uI`).

The file has **no Figma Variables**; values below come from audited frames + conflict precedence in the implementation prompt. Figma MCP was used to verify node identity and Profile composition (`16:615`).

## Reference node IDs

| Area | Node ID | Name (as in file) |
| --- | --- | --- |
| Profile screen root | `16:615` | Profile page |
| Profile content | `16:628` | Profile content |
| Member Home | `7:3` | screen.png |
| Schedule | `9:205` | screen.png |
| Activity | `5:4` | SuprCircle |
| Digital member card | `12:599` | screen.png |
| Session detail | `32:463` | Session detail |
| Event detail | `32:546` | Event detail |
| Location detail | `35:633` | rincian-lokasi |

## Typography — Lato decision

| Source | Observed family | Decision |
| --- | --- | --- |
| Profile `16:628`, Activity `5:4`, Member Card `12:599` | Lato | Canonical |
| Home `7:3`, Session/Event detail | Plus Jakarta Sans | Normalize → Lato |
| Schedule `9:205`, Location `35:633` | Nunito Sans | Normalize → Lato |

SuprCircle v1 ships **one** UI family: Lato (300/400/400i/700/900), bundled OFL.

## Near-duplicate greens → semantic mapping

| Primitive | Hex | Canonical semantic use |
| --- | --- | --- |
| `green.00472e` | `#00472E` | `action.primary.background` |
| `green.004936` | `#004936` | `navigation.active` |
| `green.075237` | `#075237` | `action.primary.onContainer`, `feedback.success.foreground` |
| `mint.c9f3dc` | `#C9F3DC` | `action.primary.container` |
| `mint.eaf9f1` | `#EAF9F1` | `feedback.success.container` |
| `green.002e21`, `004c36`, `004d37`, `064d35` | (variants) | **Primitive only** — not promoted to global semantics |
| `mint.baf1d4`, `bcefd4`, `c9f4df` | (variants) | **Primitive only** |

## Near-duplicate neutrals

| Primitive | Hex | Semantic |
| --- | --- | --- |
| `neutral.101a16` | `#101A16` | `content.primary` |
| `neutral.4d5752` | `#4D5752` | `content.secondary` |
| `neutral.090b0c`, `4d5154` | — | Primitive only (Home/detail ink variants) |
| `neutral.f7f8fd` | `#F7F8FD` | `surface.canvas` |
| `neutral.fafbfe` | `#FAFBFE` | `surface.header` |

## Measured geometry (logical px)

| Role | Value |
| --- | --- |
| Frame width reference | ~318–349 (not a device check) |
| Header height | 57 |
| Bottom navigation height | 73 |
| Primary CTA height | 46 |
| Page padding X | 14 (compact 13) |
| Card padding | 13 (compact 12, roomy 20) |
| Card radius | 10 (member card 11) |
| Chip radius | 14 |
| CTA/pill radius | 24 |
| Default gap / section gap | 8 / 14 |
| Min touch target | 44 |

## Unresolved / owner questions

1. Should Plus Jakarta / Nunito frames in Figma be updated to Lato for designer parity, or is token-side normalization enough for v1?
2. When should near-duplicate greens (`004c36` / `004d37`) earn their own semantic roles?
3. Dark theme: no design yet — keep APIs open, do not invent.
4. Brand SVG icons: export only when original node exports are available; product art stays in `suprcircle-mobile`.
