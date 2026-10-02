---
name: Common
description: Community conversations with an original, approachable identity.
colors:
  primary: "hsl(242 41% 46.3%)"
  primary-dark: "hsl(249 70% 80%)"
  primary-foreground: "hsl(0 0% 100%)"
  primary-foreground-dark: "hsl(240 25% 13%)"
  background: "hsl(45 25% 97%)"
  background-dark: "hsl(240 18% 10%)"
  card: "hsl(0 0% 100%)"
  card-dark: "hsl(240 16% 14%)"
  foreground: "hsl(240 15% 15%)"
  foreground-dark: "hsl(45 20% 94%)"
  muted-foreground: "hsl(240 6% 40%)"
  muted-foreground-dark: "hsl(240 10% 72%)"
  border: "hsl(45 10% 86%)"
  border-dark: "hsl(240 13% 27%)"
  muted: "hsl(250 40% 94%)"
  muted-dark: "hsl(240 14% 20%)"
  input: "hsl(45 10% 80%)"
  input-dark: "hsl(240 13% 35%)"
  destructive: "hsl(0 70% 43%)"
  destructive-dark: "hsl(0 65% 42%)"
  error-dark: "#fca5a5"
typography:
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.333333
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "12px"
  field: "14px"
  card: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.field}"
    height: "40px"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.field}"
    height: "40px"
    padding: "8px 12px"
---

# Design System: Common

## Overview

**Creative North Star: "Conversations first"**

A calm, approachable community app where conversations lead. Preserve existing features and URLs while giving the application its own identity. Linear, Notion and Airbnb analyses in VoltAgent/awesome-design-md informed hierarchy, typography and discovery; no proprietary fonts or brand assets are copied.

**Key Characteristics:**

- Warm neutrals
- Indigo and soft lavender
- Layered dark surfaces
- Mobile conversation focus

## Colors

CSS variables in app/globals.css are the runtime source of truth. Warm off-white canvas, white cards and indigo accents in light mode; charcoal canvas, visibly lighter cards and pale lavender accents in dark mode. Muted text remains readable. Do not rely on color alone for saved, joined, voted or unread states.

Destructive actions retain the red destructive fill with white text in both themes. Inline errors use the destructive text color in light mode and pale red in dark mode, with a subtle destructive surface and border; the dark error text treatment does not change button fills.

## Typography

The existing Next-hosted Inter font is retained. Page titles use 24–30px and weight 600; post titles 18–20px; body 14–16px; metadata 12px. Rich text remains fully readable on post detail pages. Feed text previews use four lines.

## Layout

Header with search, theme and account controls. Desktop at 1024px gains a 208px fixed, scrollable navigation rail; a contextual 280px right rail appears at 1280px. At smaller widths use a single column and fixed bottom navigation with safe-area padding. Mobile homepage omits the duplicate composer shortcut because the Post tab already opens community selection. Feed controls and pagination retain query URLs.

The app container caps at 1440px, the page grid at 1100px and single-column pages at 800px. Pages use 16px horizontal padding, 24px vertical padding and 24px grid gaps. Below 640px, search occupies its own header row, community join controls occupy their own row, and the community chooser's Visit/Create post action spans a separate full-width row.

## Elevation & Depth

Use borders and tonal surfaces for feed cards instead of decorative shadows. Existing Radix popovers and dialogs retain their functional elevation.

## Shapes

Cards use 16px corners, navigation/search controls 12px, and shared buttons/inputs 14px; flair labels use smaller rounded shapes. Navigation, vote controls and submit buttons provide 44px minimum targets; the shared button and input defaults remain 40px high. Media previews contain the image within 360px in the feed and 600px on the detail page; composer previews cap at 320px.

## Components

- Navigation exposes active state through aria-current. Mobile navigation has Your feed, Explore, Post, Saved and Notifications; Post opens the community chooser. Desktop also exposes Communities and joined-community links.
- Votes and saved/joined controls expose pressed state.
- One composer serves creation and editing, containing title, rich text, image preview and flair. Editing preserves the existing attachment; uploads are available for new posts. Upload progress disables submission.
- ActionForm handles structured errors and legacy action status results, preserving drafts and rendering inline feedback alongside toasts.
- Native comment details collapse entire reply threads; nested reply forms remain separately expandable.
- Empty states distinguish search results, saved posts, joined feeds and new communities.
- Keyboard focus, skip link and reduced-motion support are built in.

Shared buttons include primary, outline, secondary, ghost, link and destructive variants. Their focus rings use the primary color; disabled controls suppress interaction and reduce opacity. Inputs use an explicit input border, background surface, muted placeholder and focus ring. Feed cards are flat bordered surfaces with 16px padding on mobile and 20px from 640px. Flair chips use a faint primary surface and primary text.

## Do's and Don'ts

### Do:

- **Do** use real communities and counts.
- **Do** keep moderation and ownership controls attached to existing server actions.
- **Do** keep real user content readable.

### Don't:

- **Don't** add fabricated activity or popularity.
- **Don't** copy Reddit logos or mascots.
- **Don't** add decorative banners, gradients or a second UI library.
