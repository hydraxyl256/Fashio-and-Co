---
name: Regal Editorial
colors:
  surface: '#fef8fc'
  surface-dim: '#ded8dc'
  surface-bright: '#fef8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2f6'
  surface-container: '#f2ecf0'
  surface-container-high: '#ece6eb'
  surface-container-highest: '#e7e1e5'
  on-surface: '#1d1b1e'
  on-surface-variant: '#4d444f'
  inverse-surface: '#323033'
  inverse-on-surface: '#f5eff3'
  outline: '#7e7480'
  outline-variant: '#cfc2d1'
  surface-tint: '#7e469d'
  primary: '#430562'
  on-primary: '#ffffff'
  primary-container: '#5b247a'
  on-primary-container: '#cf92ef'
  inverse-primary: '#e6b4ff'
  secondary: '#775a1a'
  on-secondary: '#ffffff'
  secondary-container: '#fdd589'
  on-secondary-container: '#775b1b'
  tertiary: '#3d174f'
  on-tertiary: '#ffffff'
  tertiary-container: '#552e67'
  on-tertiary-container: '#c799da'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f5d9ff'
  primary-fixed-dim: '#e6b4ff'
  on-primary-fixed: '#30004a'
  on-primary-fixed-variant: '#642d83'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#e8c177'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5c4202'
  tertiary-fixed: '#f7d8ff'
  tertiary-fixed-dim: '#e6b5f8'
  on-tertiary-fixed: '#2f0741'
  on-tertiary-fixed-variant: '#5e3770'
  background: '#fef8fc'
  on-background: '#1d1b1e'
  surface-variant: '#e7e1e5'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  stack-lg: 64px
  stack-md: 32px
  stack-sm: 16px
---

## Brand & Style

This design system embodies the essence of Nairobi-based high fashion: a fusion of traditional luxury and contemporary elegance. The brand personality is **sophisticated, feminine, and authoritative**, aiming to evoke a sense of exclusivity and timeless grace in the user.

The visual style is **Editorial Minimalism**. It prioritizes high-quality photography and generous whitespace to allow product imagery to breathe. The interface utilizes a "High-Contrast & Refined" approach, where sharp typography and a rich, regal color palette create a digital experience that feels like flipping through a premium fashion magazine. Visual hierarchy is maintained through strict grid adherence and intentional use of Soft Gold accents to highlight jewelry and premium details.

## Colors

The palette is anchored by **Deep Royal Purple**, derived directly from the brand’s signature dress mark, used for primary calls-to-action and critical brand moments. **Plum** provides depth for hover states and dark accents, while **Soft Lavender** serves as a delicate tint for secondary backgrounds and subtle containers.

**Warm Ivory** is the primary canvas, providing a more human and premium feel than pure white. **Charcoal** ensures maximum legibility for body copy, avoiding the harshness of pure black. **Soft Gold** is reserved for premium highlights, jewelry pricing, and decorative strokes, signaling luxury. **Muted Taupe** acts as a functional neutral for borders, dividers, and disabled states.

## Typography

This design system uses a high-contrast typographic pairing to reinforce its editorial narrative. **Playfair Display** is the voice of the brand, used for all headlines and display text. It should be typeset with tight letter spacing for large headers to maintain a "fashion masthead" aesthetic.

**Montserrat** provides a clean, modern counterpoint for all functional UI elements and long-form body text. Its geometric clarity ensures readability and a contemporary feel. Labels and small navigation items should utilize the uppercase Montserrat with increased letter spacing to evoke the look of high-end brand tags and architectural signage.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop and a **4-column grid** for mobile. It prioritizes "asymmetric balance"—often placing products off-center or utilizing staggered image heights to mimic a magazine spread.

Generous margins (80px on desktop) are mandatory to maintain the "luxury" feel, as density is often perceived as "discount" in fashion. Vertical rhythm follows a strict 4px base unit, with significant "breathing room" (stack-lg) between distinct sections to guide the user's eye through the brand story.

## Elevation & Depth

Visual hierarchy is achieved primarily through **Tonal Layering** and **Low-Contrast Outlines**. Surfaces should feel flat and structural, rather than floating. 

Shadows are used sparingly. When applied (e.g., on a "Quick Add" modal or a hovering product card), they must be **Ambient Shadows**: extremely diffused, low-opacity (5-8%), and tinted with a hint of Plum (#3D174F) to keep them warm. Avoid harsh, black shadows at all costs. Dividers and borders should use the Muted Taupe at 50% opacity for a soft, "ghost border" effect that defines space without cluttering the visual field.

## Shapes

The shape language is **structured and architectural**. A "Soft" roundedness (4px) is the standard for functional elements like input fields and secondary buttons to provide a touch of approachability. 

However, primary hero elements, product images, and high-level containers should maintain **sharp corners (0px)** to preserve the clean, editorial edge. This juxtaposition between soft UI and sharp imagery creates a contemporary, high-fashion aesthetic.

## Components

### Buttons
Primary buttons use the **Deep Royal Purple** background with White text and sharp corners. Hover states transition to **Plum**. Secondary buttons are outlined in **Muted Taupe** with Montserrat caps text. "Add to Bag" buttons on product pages can utilize the **Soft Gold** as a subtle underline or accent border to signify a premium purchase.

### Input Fields
Inputs are minimalist: a bottom border only in **Muted Taupe**, which transitions to **Deep Royal Purple** on focus. Labels sit above in uppercase Montserrat (label-sm).

### Product Cards
Cards are borderless with sharp-edged imagery. The product name is in Playfair Display (headline-sm) and the price in Montserrat. Use **Soft Gold** for "New In" or "Limited Edition" chips.

### Navigation
The header is sticky with a **Warm Ivory** background and a very faint bottom border. Navigation links use Montserrat (label-md) with an active state indicated by a **Deep Royal Purple** 2px underline.

### Chips & Tags
Used for sizes or categories, these should be pill-shaped with a **Soft Lavender** background and **Plum** text, providing a softer, more feminine touch to the functional UI.