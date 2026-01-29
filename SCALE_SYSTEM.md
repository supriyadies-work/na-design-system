# Scale System Documentation

Design system ini sekarang mendukung multiple scales untuk berbagai brand/proyek. Default scale adalah **nisaaulia** (backward compatible), dan tersedia scale baru **supriyadies** dengan spacing dan typography yang lebih besar.

## Available Scales

### 1. Nisaaulia (Default)
- **Multiplier**: 1.0 (base values)
- **Description**: Default scale untuk Nisa Aulia portfolio - mempertahankan nilai existing design system
- **Backward Compatible**: Ya, ini adalah default dan tidak akan mengubah behavior existing

### 2. Supriyadies
- **Multiplier**: 1.25 (25% increase)
- **Spacing Multiplier**: 1.25
- **Font Size Multiplier**: 1.15
- **Line Height Multiplier**: 1.1
- **Border Radius Multiplier**: 1.2
- **Description**: Scale lebih besar untuk brand Supriyadies

## Usage

### Option 1: Using ScaleProvider (Recommended)

Wrap your app dengan `ScaleProvider` untuk mengaktifkan scale system:

```tsx
import { ScaleProvider } from "@supriyadies-work/na-design-system";

// For nisaaulia (default - backward compatible)
export default function App() {
  return (
    <ScaleProvider>
      <YourApp />
    </ScaleProvider>
  );
}

// For supriyadies
export default function App() {
  return (
    <ScaleProvider defaultScale="supriyadies">
      <YourApp />
    </ScaleProvider>
  );
}
```

### Option 2: Using Environment Variable

Set environment variable `NEXT_PUBLIC_DESIGN_SYSTEM_SCALE`:

```env
# .env.local
NEXT_PUBLIC_DESIGN_SYSTEM_SCALE=supriyadies
```

Kemudian initialize di root layout:

```tsx
import { initScale } from "@supriyadies-work/na-design-system";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  useEffect(() => {
    initScale();
  }, []);

  return <>{children}</>;
}
```

### Option 3: Manual Scale Setting

```tsx
import { setScale } from "@supriyadies-work/na-design-system";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    setScale("supriyadies");
  }, []);

  return <YourApp />;
}
```

### Using Scale Hook

```tsx
import { useScale } from "@supriyadies-work/na-design-system";

function MyComponent() {
  const { scale, setScale, config } = useScale();

  return (
    <div>
      <p>Current scale: {scale}</p>
      <p>Multiplier: {config.multiplier}</p>
      <button onClick={() => setScale("supriyadies")}>
        Switch to Supriyadies
      </button>
      <button onClick={() => setScale("nisaaulia")}>
        Switch to Nisaaulia
      </button>
    </div>
  );
}
```

### Applying Scaled Values

```tsx
import { applyScale } from "@supriyadies-work/na-design-system";

// Apply spacing scale
const spacing = applyScale("1rem", "spacing"); // Returns "1.25rem" for supriyadies

// Apply font size scale
const fontSize = applyScale("16px", "fontSize"); // Returns "18.4px" for supriyadies

// Apply general multiplier
const value = applyScale(10, "multiplier"); // Returns "12.5" for supriyadies
```

### Using CSS Variables

Include scale CSS di aplikasi:

```tsx
// In your global CSS or layout
import "@supriyadies-work/na-design-system/css/scale";
```

Atau via CSS:

```css
@import "@supriyadies-work/na-design-system/css/scale";
```

Kemudian gunakan CSS variables:

```css
.my-element {
  /* Spacing akan di-scale otomatis */
  padding: calc(1rem * var(--scale-spacing, 1));
  
  /* Font size akan di-scale */
  font-size: calc(1rem * var(--scale-font-size, 1));
  
  /* Border radius akan di-scale */
  border-radius: calc(0.5rem * var(--scale-border-radius, 1));
}
```

## Migration Guide

### For Nisaaulia Projects (No Changes Needed)

**Tidak perlu perubahan apapun!** Default scale adalah nisaaulia, jadi semua existing code akan tetap bekerja seperti sebelumnya.

### For Supriyadies Projects

1. Install design system:
   ```bash
   npm install @supriyadies-work/na-design-system@latest
   ```

2. Wrap app dengan ScaleProvider:
   ```tsx
   import { ScaleProvider } from "@supriyadies-work/na-design-system";
   
   <ScaleProvider defaultScale="supriyadies">
     <App />
   </ScaleProvider>
   ```

3. Import scale CSS (optional, untuk CSS variable support):
   ```tsx
   import "@supriyadies-work/na-design-system/css/scale";
   ```

4. Done! Semua components akan otomatis menggunakan scale supriyadies.

## API Reference

### `ScaleProvider`

React provider untuk scale context.

**Props:**
- `children: React.ReactNode` - Child components
- `defaultScale?: ScaleName` - Default scale (default: "nisaaulia")

### `useScale()`

Hook untuk mengakses scale context.

**Returns:**
```typescript
{
  scale: ScaleName;
  setScale: (scale: ScaleName) => void;
  config: ScaleConfig;
}
```

### `setScale(scale: ScaleName)`

Set active scale secara programmatic.

### `getCurrentScale(): ScaleName`

Get current active scale name.

### `getScaleConfig(): ScaleConfig`

Get current scale configuration.

### `applyScale(baseValue, scaleType)`

Apply scale multiplier ke value.

**Parameters:**
- `baseValue: string | number` - Base value (e.g., "1rem", "16px", 16)
- `scaleType: "multiplier" | "spacing" | "fontSize" | "lineHeight" | "borderRadius"` - Type of scale

**Returns:** `string` - Scaled value

### `getScaleCSSVar(scaleType)`

Get CSS variable name untuk scale type.

**Returns:** `string` - CSS variable (e.g., "var(--scale-spacing, 1)")

### `initScale()`

Initialize scale dari environment variable atau data attribute.

## CSS Variables

Scale system menyediakan CSS variables berikut:

- `--scale-multiplier` - General multiplier (default: 1)
- `--scale-spacing` - Spacing multiplier (default: 1)
- `--scale-font-size` - Font size multiplier (default: 1)
- `--scale-line-height` - Line height multiplier (default: 1)
- `--scale-border-radius` - Border radius multiplier (default: 1)

## Examples

### Example 1: Basic Usage

```tsx
import { ScaleProvider, Button } from "@supriyadies-work/na-design-system";

function App() {
  return (
    <ScaleProvider defaultScale="supriyadies">
      <Button>Click me</Button>
    </ScaleProvider>
  );
}
```

### Example 2: Dynamic Scale Switching

```tsx
import { ScaleProvider, useScale, Button } from "@supriyadies-work/na-design-system";

function ScaleSwitcher() {
  const { scale, setScale } = useScale();
  
  return (
    <div>
      <p>Current: {scale}</p>
      <Button onClick={() => setScale("nisaaulia")}>Nisaaulia</Button>
      <Button onClick={() => setScale("supriyadies")}>Supriyadies</Button>
    </div>
  );
}

function App() {
  return (
    <ScaleProvider>
      <ScaleSwitcher />
    </ScaleProvider>
  );
}
```

### Example 3: Custom Scaled Values

```tsx
import { applyScale } from "@supriyadies-work/na-design-system";

function CustomComponent() {
  const spacing = applyScale("1rem", "spacing");
  const fontSize = applyScale("16px", "fontSize");
  
  return (
    <div style={{ padding: spacing, fontSize }}>
      Scaled content
    </div>
  );
}
```

## Notes

- **Backward Compatibility**: Default scale adalah nisaaulia, jadi semua existing code tetap bekerja tanpa perubahan
- **CSS Variables**: Scale variables di-set otomatis di `document.documentElement` saat scale diubah
- **Data Attribute**: Scale juga di-set sebagai `data-scale` attribute di root element untuk CSS targeting
- **Type Safety**: Semua scale functions fully typed dengan TypeScript
