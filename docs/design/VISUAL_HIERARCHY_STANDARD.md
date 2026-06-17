# OffgridMobile Visual Hierarchy Standard (Aurora)

## Purpose

This document defines the canonical visual hierarchy for ALL screens in OffgridMobile. The Aurora design system uses a vibrant multi-color palette, expressive typography with stronger weights, and playful use of gradients to create an engaging and intuitive experience.

---

## Aurora Color System

The palette has four accent colors, each with semantic meaning:

| Token | Color | Hex | Role |
|---|---|---|---|
| `colors.primary` | Violet | `#A78BFA` / `#7C3AED` | Primary actions, headings, focus states |
| `colors.secondary` | Emerald | `#34D399` / `#10B981` | Success, nature, image-generation |
| `colors.accent` | Amber | `#FBBF24` / `#F59E0B` | Energy, trending, premium/pro |
| `colors.info` | Cyan | `#38BDF8` / `#0EA5E9` | Data, AI indicators, links |

Background shades shift from deep navy (`#0D0D1A`) through midnight (`#1A1A2E`) to dark indigo (`#252547`), giving depth without pure black.

Gradients live in `GRADIENTS` (exported from `src/theme/palettes.ts`) and should be applied via `react-native-linear-gradient`.

---

## The 5 Text Categories

### 1. **TITLE** - Screen/Page Titles

**Typography Token**: `TYPOGRAPHY.h1`  
**Size**: 26px  
**Weight**: 600  
**Color**: `colors.text`  
**Letter Spacing**: -0.8  

**Usage**:
- Main screen titles, hero headings
- Accent color (`colors.primary`) may be applied to a word/prefix for visual pop
- ONE per screen maximum

**Examples**:
- `<Text style={{color: colors.primary}}>Off</Text> Grid`
- "Models"
- "Conversations"

---

### 2. **SUBTITLE** - Section Headers & Modal Titles

**Typography Token**: `TYPOGRAPHY.h3`  
**Size**: 14px  
**Weight**: 500  
**Color**: `colors.text` or `colors.textSecondary`  

**Usage**:
- Section headers within a screen
- Modal/dialog titles
- Card headings with actions

---

### 3. **DESCRIPTION** - Explanatory Text

**Typography Token**: `TYPOGRAPHY.bodySmall`  
**Size**: 13px  
**Weight**: 400  
**Color**: `colors.textSecondary`  
**Line height**: 20

**Usage**:
- Help text, empty states, value propositions
- Paragraphs under a title

---

### 4. **BODY** - Main Content

**Typography Token**: `TYPOGRAPHY.body`  
**Size**: 15px  
**Weight**: 400  
**Color**: `colors.text`  
**Line height**: 22

**Usage**:
- Chat messages
- Form inputs
- Button labels (weight 500)
- List item names

---

### 5. **META** - Metadata

**Typography Token**: `TYPOGRAPHY.meta` / `TYPOGRAPHY.label`  
**Size**: 10–11px  
**Weight**: 400–500  
**Color**: `colors.textMuted`  
**Letter Spacing**: 0.6–1.0 for labels (uppercase)

**Usage**:
- Timestamps, file sizes, model params
- Uppercase category chips/tags

---

## Gradient Usage Rules

| Context | Gradient | Token |
|---|---|---|
| Primary CTA button | violet → indigo | `GRADIENTS.primary` |
| Hero sections / onboarding | violet → cyan → emerald | `GRADIENTS.aurora` |
| Alerts / warnings | amber → red | `GRADIENTS.warm` |
| Image-gen context | emerald → teal | `GRADIENTS.nature` |
| Active card accent bar | solid `colors.primary` or `colors.secondary` | — |

Never use gradients on body text. Gradient text is reserved for large display headings only, and only when the background provides enough contrast.

---

## Card & Component Rules

| Property | Value |
|---|---|
| Card border radius | 16px (standard), 14px (compact) |
| Button border radius | 12px |
| Sheet border radius | 20–24px |
| Card border | 1px `colors.border` at rest; 1.5px `colors.primary` when active |
| Active card indicator | 3px top bar in the accent color for that category |
| Shadow | `shadows.small` (default), `shadows.glow` for focus/active |

---

## Icon Rules

- Use `react-native-vector-icons/Feather` by default
- Use `MaterialCommunityIcons` only when Feather lacks a suitable icon (e.g. `crown`, `whatshot`)
- Icon size: 16px (body), 14px (meta), 20px (action)
- Icon color: matches the text hierarchy level at that position, or uses the semantic accent color (e.g. amber for premium crown icon)
- No emojis in UI text

---

## What Changed from the Brutalist System

| Old | New |
|---|---|
| Single emerald accent | Four accent colors (violet, emerald, amber, cyan) |
| Pure black `#0A0A0A` background | Deep navy `#0D0D1A` background |
| Weights ≤ 400 | Weights up to 600 for titles/CTAs |
| No gradients | Gradients for buttons, onboarding, hero sections |
| 8px border radius | 12–16px border radius |
| Font sizes: 16/13/14/10 | Font sizes: 26/14/15/11 |
| Transparent primary buttons | Filled/gradient primary buttons |
