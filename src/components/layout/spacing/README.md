# Layout Spacing Utilities

This directory contains reusable spacing components for consistent layout hierarchy and visual breathing room across the application.

## Components

### ContentFooterSpacer

Ensures proper spacing between main content and footer, following YC-style best practices.

#### Usage

```tsx
import { ContentFooterSpacer } from '@/src/components/layout/spacing';

// Default spacing (48px mobile, 64px desktop)
<ContentFooterSpacer />

// Small spacing for dense layouts
<ContentFooterSpacer size="sm" />

// Large spacing for important sections
<ContentFooterSpacer size="lg" />

// Extra large spacing for landing pages
<ContentFooterSpacer size="xl" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'default' \| 'lg' \| 'xl'` | `'default'` | Spacing size variant |
| `className` | `string` | `''` | Additional CSS classes |

#### Spacing Scale

| Size | Mobile | Desktop | Use Case |
|------|--------|---------|----------|
| `sm` | 32px | 48px | Dense layouts, cards |
| `default` | 48px | 64px | Standard content spacing |
| `lg` | 64px | 80px | Important sections |
| `xl` | 80px | 96px | Landing pages, heroes |

## Design System Integration

These components use the established 4px grid system and follow responsive design patterns used throughout the application.

## Accessibility

- Uses `aria-hidden="true"` to hide decorative spacing from screen readers
- Includes `data-component` attribute for debugging and testing
- Maintains semantic document structure

## Performance

- Lightweight components with minimal DOM footprint
- Uses CSS classes for styling (no inline styles)
- Memoized components to prevent unnecessary re-renders