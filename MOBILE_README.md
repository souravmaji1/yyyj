# Mobile-First & Safe Area Updates

This project now includes initial mobile-focused primitives.

## Viewport
- Global viewport metadata is defined to ensure proper scaling on mobile devices (`width=device-width, initial-scale=1, viewport-fit=cover`).

## Safe Area Handling
- Added CSS custom properties `--safe-top` and `--safe-bottom` using `env(safe-area-inset-*)`.
- Introduced a `SafeArea` layout component that applies these paddings.
- `app/layout.tsx` wraps page content with `SafeArea` so headers and footers avoid iOS notch cutouts.

## Extending
- Use the `SafeArea` component for any fixed headers or footers.
- Reference `--safe-top` and `--safe-bottom` in styles when creating new components that stick to the viewport edges.

Run `npm run lint` and `npm run build` to verify changes.
