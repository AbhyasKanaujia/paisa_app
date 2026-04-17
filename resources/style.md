# Frontend Style Guide

**Inspiration:** Early-2010s editorial utility (Instapaper, early Rdio). Simple, structural, deliberate. No decoration for decoration's sake.

## Typography

- Display/headings: `Lora` (serif, Google Fonts)
- UI chrome, chat, labels: `JetBrains Mono` (monospace, Google Fonts)
- Never use Inter, Roboto, Arial, or system-ui

## Color Palette

| Role | Value | Tailwind |
|---|---|---|
| Background | `#ffffff` | `white` |
| Surface/panel | `#fafaf8` | `stone-50` |
| Primary text | `#1c1917` | `stone-900` |
| Secondary text | `#78716c` | `stone-500` |
| Muted/placeholder | `#d6d3d1` | `stone-300` |
| Borders | `#e7e5e4` | `stone-200` |
| Accent (aged gold) | `#c8a96e` | — |
| Major dividers | `#1c1917` | `stone-900` |

The accent `#c8a96e` is used sparingly — chat prompt prefix, active states, highlights only.

## Shape & Spacing

- Zero border-radius on cards and panels
- `1px` borders (`stone-200`) for cards
- `2px solid stone-900` for major section dividers
- Generous padding inside panels; compact header

## Layout

- Home page: full-height split — top 70% main app area (scrollable), bottom 30% AI chat panel, separated by a thick divider
- Header: minimal — logo left, single action right

## Interaction

- No shadows, no gradients, no glassmorphism
- Hover states via color transitions only (`transition-colors`)
- Chat prompt prefix: `›` in accent gold

## Tone

Utilitarian and calm. Every element earns its place.
