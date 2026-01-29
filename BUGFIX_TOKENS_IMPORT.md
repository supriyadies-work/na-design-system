# Bug Fix: Tokens Import Path

## 🐛 Masalah

File `src/utils/tokens.ts` memiliki import path yang salah yang menyebabkan error setelah build di project yang menggunakan design system:

```
Module not found: Can't resolve '../dist/js/tokens'
./node_modules/@supriyadies-work/na-design-system/dist/js/utils/tokens.js:6:1
```

## 🔍 Root Cause

**File yang bermasalah:** `src/utils/tokens.ts`

**Import yang salah (sebelum fix):**

```typescript
import * as tokens from "../dist/js/tokens";
```

**Analisis path:**

- Source file: `src/utils/tokens.ts`
- Output setelah build: `dist/js/utils/tokens.js`
- Tokens file (generated): `dist/js/tokens.js`

**Dari `dist/js/utils/tokens.js`, path `../dist/js/tokens` akan mencari:**

- `dist/js/utils/../dist/js/tokens` → `dist/js/dist/js/tokens` ❌ (tidak ada)

## ✅ Solusi

**Import yang benar (setelah fix):**

```typescript
import * as tokens from "../tokens";
```

**Dari `dist/js/utils/tokens.js`, path `../tokens` akan mencari:**

- `dist/js/utils/../tokens` → `dist/js/tokens.js` ✅ (benar)

## Perubahan yang Diperlukan

### 1. Fix Source File

**File:** `src/utils/tokens.ts`

**Ubah dari:**

```typescript
import * as tokens from "../dist/js/tokens";
```

**Menjadi:**

```typescript
import * as tokens from "../tokens";
```

### 2. Verifikasi Build

Setelah fix, pastikan:

1. **Build package:**

   ```bash
   npm run build
   ```

2. **Cek output file:**

   ```bash
   cat dist/js/utils/tokens.js | grep "import.*tokens"
   ```

   Harus menampilkan:

   ```javascript
   import * as tokens from "../tokens";
   ```

3. **Test di project:**

   ```bash
   # Di project yang menggunakan design system
   npm install @supriyadies-work/na-design-system@latest
   # atau
   yarn add @supriyadies-work/na-design-system@latest
   ```

4. **Verifikasi tidak ada error:**
   - Build berhasil tanpa error
   - Import `RichTextEditor` berfungsi
   - Import token utilities berfungsi

## Catatan Development

**Selama development:**

- File tokens di-generate di `dist/js/tokens.js` oleh `build:tokens` script
- Path `../tokens` dari `src/utils/tokens.ts` akan mencari `src/tokens` (tidak ada)
- TypeScript mungkin akan complain, tapi ini OK karena:
  - File tokens di-generate selama build
  - Path akan benar setelah build ke `dist/js/utils/tokens.js`

**Jika TypeScript error selama development:**

- Bisa di-ignore dengan `// @ts-ignore` atau
- Setup path alias untuk development
- Atau generate tokens file sebelum compile

## Testing Checklist

Setelah fix, test di:

- [ ] Build package berhasil
- [ ] Output file memiliki import path yang benar
- [ ] Install di Next.js 16.x project
- [ ] Import `RichTextEditor` berfungsi
- [ ] Import token utilities berfungsi
- [ ] Tidak ada module resolution error

## Impact

**Priority:** HIGH

Bug ini menyebabkan:

- ❌ Build error di semua project yang menggunakan design system
- ❌ Tidak bisa menggunakan `RichTextEditor` component
- ❌ Tidak bisa menggunakan token utilities

**Affected versions:**

- `@supriyadies-work/na-design-system@1.1.21` dan sebelumnya
- Semua versi yang memiliki import path `"../dist/js/tokens"`

## Next Steps

1. ✅ Fix source file (`src/utils/tokens.ts`)
2. ✅ Rebuild package
3. ✅ Test build output
4. ✅ Publish versi baru (patch version)
5. ✅ Update semua project yang menggunakan design system
