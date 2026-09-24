# SuprCircle asset manifest schema

Versioned contract for reusable brand assets. Do **not** commit placeholder icons or traced screenshots. Product-specific images stay in `suprcircle-mobile`.

## Schema (`docs/suprcircle/asset-manifest.schema.json`)

Each entry:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Stable semantic asset ID |
| `figmaFileKey` | string | yes | Figma file key |
| `figmaNodeId` | string | yes | Node ID (`16:628` form) |
| `type` | enum | yes | `svg` \| `raster` \| `font` \| `illustration` |
| `destination` | string | yes | Path inside package or consumer app |
| `width` | number | no | Intrinsic width |
| `height` | number | no | Intrinsic height |
| `aspectRatio` | number | no | When size is flexible |
| `license` | string | yes | SPDX or notice pointer |
| `sourceUrl` | string | no | Authoritative upstream URL |
| `checksumSha256` | string | yes | Hex digest of committed bytes |
| `themes` | string[] | yes | e.g. `["light"]` — dark only when designed |
| `accessibility` | enum | yes | `decorative` \| `semantic` |

Export SVG/raster from Figma only when the original node export is available. Never leave temporary Figma asset URLs in source.
