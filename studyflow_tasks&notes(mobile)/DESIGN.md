---
name: Glacier Flow
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dade'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8ec'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1f'
  on-surface-variant: '#3f484e'
  inverse-surface: '#2d3134'
  inverse-on-surface: '#eef1f4'
  outline: '#6f787e'
  outline-variant: '#bec8ce'
  surface-tint: '#006686'
  primary: '#006686'
  on-primary: '#ffffff'
  primary-container: '#75cdf6'
  on-primary-container: '#005672'
  inverse-primary: '#7ad1fb'
  secondary: '#456272'
  on-secondary: '#ffffff'
  secondary-container: '#c5e4f6'
  on-secondary-container: '#496776'
  tertiary: '#875200'
  on-tertiary: '#ffffff'
  tertiary-container: '#fdb45d'
  on-tertiary-container: '#734600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0e8ff'
  primary-fixed-dim: '#7ad1fb'
  on-primary-fixed: '#001e2b'
  on-primary-fixed-variant: '#004d66'
  secondary-fixed: '#c8e7f9'
  secondary-fixed-dim: '#accbdd'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#2c4b59'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb866'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#f7fafd'
  on-background: '#181c1f'
  surface-variant: '#e0e3e6'
typography:
  headline-xl:
    fontFamily: Bodoni Moda
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Anybody
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Anybody
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  note-list-width: 320px
  gutter: 1rem
  margin-page: 1.5rem
  stack-gap: 0.75rem
---

## Brand & Style

The design system is centered on the concept of "Deep Focus," utilizing a light glassmorphism aesthetic to create a calm, immersive environment for students. The brand personality is premium, academic, and organized, evoking the quiet clarity of a sunlit frozen landscape.

The visual style leverages **Glassmorphism** to establish hierarchy. By using translucent layers, background blurs, and luminous borders, the UI feels lightweight and atmospheric. This approach minimizes cognitive load, allowing student content—notes, tasks, and schedules—to remain the focal point. The interface avoids heavy shadows in favor of light-based depth, where "higher" elements appear more translucent and luminous against the bright, clean backdrop.

## Colors

The palette is anchored in a refined **Slate Grey** neutral base (#74787b) to provide a professional, grounded character while reducing eye strain. **Deep Cerulean** is the primary functional color (#1080a6), reserved for interactive elements, progress indicators, and primary actions. **Muted Blue-Grey** (#5d7b8b) serves as a secondary accent for categorization, such as specific subjects or priority tasks, while **Soft Amber** (#fdb45d) provides a warm tertiary accent for high-priority highlights.

Surface colors in this light mode utilize varying degrees of transparency and high-key brightness. Backgrounds are crisp, while all interactive containers and panels utilize a frosted glass effect that subtly tints the underlying content, pulling from the cool professional tones of the system.

## Typography

This design system employs a sophisticated typographic pairing to balance academic heritage with technical precision. Headlines are set in **Bodoni Moda**, a high-contrast serif that evokes a premium, scholarly feel. 

Body text uses **Inter** for maximum legibility across dense information layouts, optimized for long-form reading with generous line heights. Metadata, tags, and functional UI labels use **Anybody**, a flexible and modern typeface that provides a distinct character for small-scale technical information. Information hierarchy is reinforced through tonal contrast; primary information uses high-contrast text, while metadata and secondary labels use the updated slate-grey neutral tones.

## Layout & Spacing

The layout follows a **multi-pane integrated view** designed for high-efficiency multitasking. It consists of three primary vertical zones:
1.  **Global Navigation Sidebar:** A narrow, translucent rail for high-level app switching (Notes, Tasks, Calendar).
2.  **Collection Pane:** A secondary list view for browsing notes or task groups, using the "selected state" to drive the main content.
3.  **Editor/Workspace:** The primary focal area for content creation and viewing.

On desktop, these panes are persistent. On tablet, the collection pane becomes a collapsible drawer. On mobile, the system reflows into a single-pane view with a bottom navigation bar replacing the sidebar. Spacing is governed by a strict 4px grid to maintain alignment across complex UI components.

## Elevation & Depth

Depth in this design system is achieved through **optical thickness** and **blur intensity** optimized for a light interface.

- **Layer 0 (Base):** Solid, bright neutral background using the slate-grey base.
- **Layer 1 (Panels):** Low opacity with 16px backdrop blur. Used for sidebar and side-panes.
- **Layer 2 (Modals/Active Cards):** Moderate opacity with 24px backdrop blur. Used for elements that sit "above" the main workspace.
- **Luminous Borders:** All elevated elements must have a 1px solid border. This creates the "frozen edge" effect that defines the style, appearing as a crisp definition against the light surfaces.
- **Interaction Glow:** For active states, a subtle soft glow may be applied to simulate light passing through the glass.

## Shapes

The design system uses a **Soft (4px-8px)** shape language. This creates a precision-engineered aesthetic that feels sharp and professional while avoiding harshness.

Standard components like buttons and inputs use the base 4px (`0.25rem`) radius. Larger containers, such as the editor pane and main navigation panels, use an 8px (`0.5rem`) radius to maintain a cohesive, sophisticated profile that complements the elegance of the serif typography.

## Components

- **Buttons:** Primary buttons use a semi-transparent Deep Cerulean fill with a high-contrast cerulean border. Hover states increase the fill opacity and saturation.
- **Glass Cards:** Use the frosted glass base background with a luminous edge. For the integrated note list, the "active" card should have a 2px left-border highlight in Primary Deep Cerulean.
- **Input Fields:** Styled as recessed glass plates. On focus, the border opacity increases, and a subtle inner glow is applied.
- **Sidebar Nav:** Navigation items use ghost-styling (text/icon only) when inactive. The active state is indicated by a pill-shaped translucent background and primary-colored icon.
- **Chips/Tags:** Small, soft-cornered elements with a subtle Amber or Blue-Grey tint to categorize study subjects. Labels within chips are set in **Anybody**.
- **Task List:** Integrated directly within note views; checkboxes are custom-styled as circles with a primary-colored glow when checked.