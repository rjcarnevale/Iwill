# CLAUDE.md — Iwill Design System & Brand Guide

## What is Iwill?

Iwill is a social estate planning app that combines dark humor with inheritance functionality. Think "Venmo for death" — users publicly will items to recipients, creating a social feed of bequests. The viral mechanic: non-users must sign up to see what they've inherited.

---

## Brand Voice

**Tone:** Morbid but fun. Irreverent. The kind of humor that makes you laugh and then feel slightly guilty about it.

**We are:**
- Dark but not depressing
- Funny but not flippant about death itself
- Millennial/Gen-Z friendly
- Making estate planning less boring and more shareable

**We are NOT:**
- Somber or serious
- Clinical or legal-sounding
- Preachy about mortality
- Mean-spirited

**Example copy:**
- "You can't take it with you, but you can decide who gets it."
- "Your baggage deserves a beneficiary."
- "Some legacies are legally binding."
- "She judges. She has always judged."
- "It cannot be destroyed. It must be passed on."

---

## Color Palette

### Primary Gradients

**Trending Banner:**
```css
background: linear-gradient(90deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%);
/* Purple → Pink → Orange */
```

**Bottom Banner / CTA:**
```css
background: linear-gradient(90deg, #ec4899 0%, #f97316 100%);
/* Pink → Orange */
```

**Card Background:**
```css
background: linear-gradient(155deg, #1a1a2e 0%, #16213e 50%, #1a1a3e 100%);
/* Deep navy/purple dark gradient */
```

**Avatar Ring:**
```css
background: linear-gradient(135deg, #a855f7, #ec4899);
/* Purple → Pink */
```

### Solid Colors

| Use | Hex | Name |
|-----|-----|------|
| App background | `#0a0a0f` | Near black |
| Card dark | `#1a1a2e` | Deep navy |
| Text primary | `#ffffff` | White |
| Text secondary | `#9ca3af` | Gray 400 |
| Text muted | `#6b7280` | Gray 500 |
| Hearts/likes | `#f472b6` | Pink 400 |
| Skulls/reactions | `#9ca3af` | Gray 400 |

### Tag Colors

| Tag | Hex | Tailwind |
|-----|-----|----------|
| CURSED | `#ec4899` | pink-500 |
| HAUNTED | `#a855f7` | purple-400 |
| ACTUALLY COOL | `#10b981` | emerald-500 |
| DISPUTED | `#f59e0b` | amber-500 |
| SENTIMENTAL | `#3b82f6` | blue-500 |
| QUESTIONABLE | `#f97316` | orange-500 |
| TRANSFERRED ✓ | `#22c55e` | green-500 |
| EMOTIONAL BAGGAGE | `#f43f5e` | rose-500 |
| LIVING HEIRLOOM | `#22c55e` | green-500 |

---

## Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Weights:**
- Regular (400) — body text, descriptions
- Semibold (600) — secondary emphasis
- Bold (700) — headings, names, titles, tags

**Sizes:**
| Element | Size |
|---------|------|
| User name | 20px, bold |
| Item title | 19px, bold |
| Willing to / description | 14px, regular |
| Item description (quote) | 13px, regular |
| Tags | 13px, bold |
| Stats (hearts/skulls) | 14px, semibold |
| Status text | 11px, regular |
| Banner text | 14px, bold, letter-spacing: 1px |

---

## Component Patterns

### Will Card Structure

```
┌─────────────────────────────────────┐
│ 🔥 TRENDING WILL (gradient banner)  │
├─────────────────────────────────────┤
│ [Avatar] Name                       │
│          willing to [recipient]     │
├─────────────────────────────────────┤
│                                     │
│         [ITEM IMAGE]                │
│         (square, 1:1)               │
│                                     │
├─────────────────────────────────────┤
│ Item Title                    TAG   │
│ "Description in quotes"             │
├─────────────────────────────────────┤
│ ❤️ 2,847  💀 892      Status text  │
├─────────────────────────────────────┤
│ 💀 @gotwilled (gradient banner)     │
└─────────────────────────────────────┘
```

### Avatar

- Size: 56px × 56px
- Shape: Circle
- Background: Purple-to-pink gradient
- Content: Emoji (contextual to user/item)
- Border: None (gradient serves as visual weight)

### Image Area

- Aspect ratio: 1:1 (square)
- Border radius: 16px
- Margin: 16px horizontal
- Background (placeholder): `linear-gradient(135deg, #1f1f3a 0%, #2a2a4a 100%)`
- Border (placeholder): `2px dashed #4a4a6a`

### Stats Row

- Hearts: Pink (`#f472b6`), emoji + number
- Skulls: Gray (`#9ca3af`), emoji + number
- Status: Right-aligned, muted gray, max-width ~150px

---

## Spacing

| Element | Value |
|---------|-------|
| Card padding (horizontal) | 20px |
| Card padding (vertical) | 16px |
| Image margin | 16px |
| Gap between avatar and text | 14px |
| Gap between stats | 20px |
| Banner padding | 12px |

---

## Border Radius

| Element | Radius |
|---------|--------|
| App container | 0 (square for screenshots) or 20px |
| Image area | 16px |
| Avatar | 50% (circle) |
| Tags | 0 (text only, no pill) |

---

## Iconography

We use emoji for:
- Avatars (contextual: 🎣👵🦇⚖️⚓🐊🪆😤🌵)
- Stats (❤️ for likes, 💀 for skull reactions)
- Banners (🔥 for trending, 💀 for @gotwilled)

No custom icon library needed — emoji-first approach matches the playful brand.

---

## Example Item Types & Tags

| Item | Suggested Tag |
|------|---------------|
| Creepy dolls | CURSED, HAUNTED |
| Taxidermy | ACTUALLY COOL |
| Contested items | DISPUTED |
| Sentimental junk | SENTIMENTAL |
| Weird DIY crafts | QUESTIONABLE |
| Successfully transferred | TRANSFERRED ✓ |
| Items with emotional weight | EMOTIONAL BAGGAGE |
| Plants, pets | LIVING HEIRLOOM |

---

## Social Handle

**Instagram/Social:** `@gotwilled`

Always styled with skull emoji: `💀 @gotwilled`

---

## File Naming

- Mockups: `iwill-mockup-[item].png`
- Components: `WillCard.tsx`, `TrendingBanner.tsx`, etc.
- Styles: Use Tailwind classes or CSS-in-JS matching the palette above

---

## Quick Reference

```css
/* The essential Iwill gradient combo */
.trending { background: linear-gradient(90deg, #7c3aed, #db2777, #f59e0b); }
.cta { background: linear-gradient(90deg, #ec4899, #f97316); }
.card { background: linear-gradient(155deg, #1a1a2e, #16213e, #1a1a3e); }
.avatar { background: linear-gradient(135deg, #a855f7, #ec4899); }
```

---

## Notes for Claude Code

When building Iwill features:
1. Keep the dark humor in copy — don't sanitize it
2. Use emoji liberally but purposefully
3. Gradients > solid colors for emphasis
4. Square images, always 1:1
5. Status messages should be short, punchy, often in quotes
6. Tags are ALL CAPS, bold, colored by category
7. The feed should feel like scrolling through chaotic family drama
