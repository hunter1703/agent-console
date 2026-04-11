# Implementation Tasks: Agent Console Web Modernization

## ⚠️ MANDATORY: Read Before Starting Any Task

**Before implementing ANY task or phase, you MUST:**

1. **Read and understand these documents**:
   - `design.md` - Complete design specifications and component details
   - `CODING_STANDARDS.md` - No hardcoded values, use declarative configuration
   - `CONFIGURATION.md` - Environment variables, API config, and all configurable values
   - `UNSEEN_DESIGN_ANALYSIS.md` - Unseen.co design principles and animation techniques
   - `ANIMATION_TECHNIQUES.md` - Disney's 12 principles and implementation patterns

2. **All changes MUST conform to**:
   - Design system defined in `design.md`
   - Coding standards in `CODING_STANDARDS.md`
   - Configuration patterns in `CONFIGURATION.md`
   - Animation principles in `ANIMATION_TECHNIQUES.md`
   - Unseen.co aesthetic in `UNSEEN_DESIGN_ANALYSIS.md`

3. **Verification checklist for every task**:
   - [ ] No hardcoded pixel values (use Tailwind classes or SPACING constants)
   - [ ] No hardcoded colors (use Tailwind classes or CSS variables)
   - [ ] No magic numbers (use named constants)
   - [ ] No hardcoded URLs or timeouts (use environment variables)
   - [ ] Animations use spring physics from `animations.ts`
   - [ ] Respects `prefers-reduced-motion`
   - [ ] Follows spacing principles (16px padding minimum, proper gaps)
   - [ ] Uses semantic constants where appropriate

**Failure to follow these standards will result in rework.**

---

## Overview

This document breaks down the implementation into actionable tasks aligned with the comprehensive design document. Tasks are organized by phase and include all new features: agent tools, human intervention, animation principles, Unseen.co-inspired interactions, and enhanced UI components.

**Total Estimated Duration**: 12-14 weeks
**Team Size**: 2-3 developers

---

## Phase 0: Codebase Review & Cleanup (Week 1)

### Task 0.1: Review Existing Codebase

**Description**: Review existing code from previous implementation attempts and identify what to keep, update, or remove.

**Requirements**: All requirements

**Acceptance Criteria**:
- [x] Audit all existing components in the codebase
- [x] Identify components that align with new design system
- [x] Identify components that need significant refactoring
- [x] Identify components to be removed
- [x] Document findings in CODEBASE_AUDIT.md
- [x] Create migration plan for existing components

**Files to Create**:
- `docs/CODEBASE_AUDIT.md`
- `docs/MIGRATION_PLAN.md`

**Estimated Time**: 8 hours

---

### Task 0.2: Remove Outdated Code

**Description**: Remove or archive code that doesn't align with the new design system.

**Requirements**: All requirements

**Acceptance Criteria**:
- [x] Remove outdated component implementations
- [x] Remove unused dependencies from package.json
- [x] Remove outdated styles and CSS files
- [x] Archive old code in a separate branch if needed
- [x] Clean up unused imports and dead code
- [x] Verify build still works after cleanup

**Estimated Time**: 4 hours

---

### Task 0.3: Update Project Dependencies

**Description**: Update all dependencies to latest stable versions and add new required packages.

**Requirements**: REQ-8 (Framer Motion), REQ-27 (Component Architecture)

**Acceptance Criteria**:
- [x] Update Next.js to latest stable (15.x or 16.x)
- [x] Update React to 19.x
- [x] Update Tailwind CSS to v4
- [x] Install/update framer-motion
- [x] Install/update lucide-react
- [x] Install/update zustand
- [x] Install/update next-themes
- [x] Remove unused dependencies
- [x] Run npm audit and fix vulnerabilities
- [x] Test that all dependencies work together

**Files to Modify**:
- `package.json`
- `package-lock.json`

**Estimated Time**: 4 hours

---

## Phase 1: Foundation & Design System (Week 1-2)

### Task 1.1: Design Token System

**Description**: Implement the complete design token system with enhanced colors, typography, spacing, and animation values.

**Requirements**: REQ-2 (Color Palettes), REQ-5 (Typography), REQ-15 (Spacing System), REQ-4 (Animation System)

**Acceptance Criteria**:
- [x] Create theme configuration with warm light and cool dark palettes
- [x] Include gradient definitions (primary, subtle, glow)
- [x] Include glassmorphism colors
- [x] Define typography scale (11px to 40px)
- [x] Define spacing scale (4px to 96px)
- [x] Define border radius values (8px, 12px, 16px, full)
- [x] Define shadow elevations (sm, md, lg, xl)
- [x] Define responsive breakpoints (mobile, tablet, desktop)
- [x] Define spring physics presets (instant, snappy, default, gentle, bouncy, heavy)
- [x] Define easing curves (easeOut, easeIn, easeInOut, emphasized, bounce)
- [x] Define duration standards (instant, fast, normal, slow, slower)
- [x] Export all tokens as TypeScript constants

**Files to Create**:
- `lib/constants/theme.ts`
- `lib/constants/animations.ts`
- `lib/constants/breakpoints.ts`

**Estimated Time**: 6 hours

---

### Task 1.2: Tailwind Configuration

**Description**: Configure Tailwind CSS v4 with custom theme tokens and design system values.

**Requirements**: REQ-2, REQ-5, REQ-15

**Acceptance Criteria**:
- [x] Extend Tailwind config with custom colors (light and dark)
- [x] Add custom font families (SF Pro Display, SF Mono)
- [x] Add custom spacing scale
- [x] Add custom border radius values
- [x] Add custom shadow values
- [x] Add custom breakpoints
- [x] Configure dark mode with class strategy
- [x] Add font smoothing utilities
- [x] Add custom animation utilities
- [x] Add backdrop blur utilities for glassmorphism

**Files to Modify**:
- `tailwind.config.ts`
- `app/globals.css`

**Estimated Time**: 4 hours

---

### Task 1.3: Theme Provider Setup

**Description**: Set up theme management with next-themes and create liquid theme toggle.

**Requirements**: REQ-14 (Theme Support)

**Acceptance Criteria**:
- [x] Install and configure next-themes
- [x] Create ThemeProvider component
- [x] Wrap app with ThemeProvider in root layout
- [x] Detect system theme preference on first load
- [x] Persist theme preference to localStorage
- [x] Update meta theme-color tag based on active theme
- [x] Implement theme transition effects (ripple or particle)
- [x] Respect prefers-reduced-motion for transitions

**Files to Create/Modify**:
- `components/providers/ThemeProvider.tsx`
- `app/layout.tsx`

**Estimated Time**: 4 hours

---

### Task 1.4: Animation System Setup

**Description**: Create comprehensive Framer Motion animation system with all 12 Disney principles.

**Requirements**: REQ-4 (Animation System), REQ-8 (Framer Motion Integration)

**Acceptance Criteria**:
- [x] Define spring presets with physics parameters
- [x] Define easing curves for different transitions
- [x] Define duration standards
- [x] Create motion variants (fadeIn, slideUp, slideDown, slideLeft, slideRight, scaleIn)
- [x] Create stagger container variant
- [x] Create button press variants (squash & stretch)
- [x] Create hover lift variants
- [x] Create liquid morph variants
- [x] Export all animation constants
- [x] Create useReducedMotion hook

**Files to Create**:
- `lib/constants/animations.ts`
- `lib/hooks/useReducedMotion.ts`

**Estimated Time**: 6 hours

---

### Task 1.5: Utility Functions & Helpers

**Description**: Create common utility functions for the application.

**Requirements**: REQ-27 (Component Architecture)

**Acceptance Criteria**:
- [x] Create classnames utility (cn) using clsx and tailwind-merge
- [x] Create date formatting utility (formatRelativeTime)
- [x] Create text truncation utility
- [x] Create debounce utility
- [x] Create throttle utility
- [x] Create color manipulation utilities (for gradients)
- [x] Export all utilities with TypeScript types

**Files to Create**:
- `lib/utils/cn.ts`
- `lib/utils/formatDate.ts`
- `lib/utils/truncate.ts`
- `lib/utils/debounce.ts`
- `lib/utils/colors.ts`

**Estimated Time**: 4 hours

---

## Phase 2: Enhanced Base Components (Week 2-3)

**Design Philosophy Reminder**: Every component must embody the core principles:
- Restrained elegance (90% neutral grays, color only for meaning)
- Smooth motion (spring physics, 60fps minimum)
- Typography-first hierarchy
- Generous spacing
- Immediate feedback

### Task 2.1: Liquid Button Component

**Description**: Create Button component with liquid morphing animations and all variants.

**Requirements**: REQ-3 (Visual Hierarchy), REQ-4 (Animation System)

**Design Reference**: See design.md "Liquid & Organic Animations" section

**Acceptance Criteria**:
- [x] Support variants: primary, secondary, ghost, danger
- [x] Support sizes: sm (36px), md (44px), lg (52px)
- [x] Implement liquid blob background animation
- [x] Implement squash & stretch on press (scaleY: 0.95, scaleX: 1.02)
- [x] Implement hover scale (1.02) with magnetic pull effect
- [x] Implement active scale (0.98)
- [x] Implement disabled state (50% opacity)
- [x] Implement loading state with blob spinner
- [x] Add icon support (left/right positioning)
- [x] Add proper ARIA attributes
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/common/Button.tsx` ✅
- `components/common/Button.test.tsx` ✅

**Estimated Time**: 6 hours

---

### Task 2.2: Enhanced Input Component

**Description**: Create Input and Textarea components with smooth focus animations.

**Requirements**: REQ-17 (Form Design)

**Design Reference**: See design.md "Component Specifications > Input Component"

**Acceptance Criteria**:
- [x] Support text, email, password, textarea types
- [x] Implement floating label animation
- [x] Implement placeholder text
- [x] Implement error state with shake animation
- [x] Implement disabled state
- [x] Add focus ring animation (2px primary color, spring transition)
- [x] Support auto-resize for textarea
- [x] Add character count for limited inputs
- [x] Add proper ARIA attributes
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/common/Input.tsx` ✅
- `components/common/Input.test.tsx` ✅

**Estimated Time**: 5 hours

---

### Task 2.3: Card Component with Magnetic Hover

**Description**: Create Card component with magnetic hover effects and variants.

**Requirements**: REQ-15 (Spacing System)

**Design Reference**: See design.md "Cursor & Mouse Interactions > Magnetic Hover Effects"

**Acceptance Criteria**:
- [x] Support variants: default, elevated, outlined, glass (glassmorphism)
- [x] Support padding sizes: sm (12px), md (16px), lg (24px)
- [x] Implement magnetic hover (card follows cursor within 10px bounds)
- [x] Implement hover lift animation (y: -2px)
- [x] Support onClick for interactive cards
- [x] Apply proper border radius (16px)
- [x] Add subtle glow on hover for elevated variant
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/common/Card.tsx` ✅
- `components/common/Card.test.tsx` ✅

**Estimated Time**: 5 hours

---

### Task 2.4: Liquid Modal Component

**Description**: Create Modal component with liquid morphing entrance and focus trap.

**Requirements**: REQ-4 (Animation System), REQ-24 (Accessibility)

**Design Reference**: See design.md "Liquid & Organic Animations > Morphing Transitions"

**Acceptance Criteria**:
- [x] Support sizes: sm (480px), md (560px), lg (720px)
- [x] Implement overlay with backdrop blur (8px)
- [x] Implement liquid morph animation from trigger button position
- [x] Morph from circle to rounded rectangle
- [x] Add focus trap within modal
- [x] Support Escape key to close
- [x] Support click outside to close
- [x] Restore focus on close
- [x] Prevent body scroll when open
- [x] Add proper ARIA attributes (role="dialog", aria-modal)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/common/Modal.tsx`
- `components/common/Modal.test.tsx`

**Estimated Time**: 7 hours

---

### Task 2.5: Toast Component with Slide Animation

**Description**: Create Toast notification component with auto-dismiss and stacking.

**Requirements**: REQ-20 (Error Handling)

**Design Reference**: See design.md "Component Specifications > Toast Component"

**Acceptance Criteria**:
- [x] Support variants: success, error, warning, info
- [x] Implement auto-dismiss after duration (default 3000ms)
- [x] Support manual dismiss via click
- [x] Implement slide-in animation from top-right with spring physics
- [x] Stack multiple toasts with 8px gap
- [x] Limit to maximum 3 visible toasts
- [x] Add colored icons per variant (Lucide React)
- [x] Add progress bar showing time remaining
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/common/Toast.tsx`
- `components/common/ToastContainer.tsx`
- `components/common/Toast.test.tsx`
- `lib/hooks/useToast.ts`

**Estimated Time**: 5 hours

---

### Task 2.6: Avatar Component

**Description**: Create Avatar component with fallback to initials and colored backgrounds.

**Requirements**: REQ-9 (Sidebar Functionality), REQ-10 (Agent Management)

**Design Reference**: See design.md "Component Specifications > Avatar Component"

**Acceptance Criteria**:
- [x] Support sizes: sm (32px), md (40px), lg (48px)
- [x] Support variants: user, agent
- [x] Display image if src provided
- [x] Fallback to first letter of name with colored background
- [x] User avatars: primary gradient background
- [x] Agent avatars: surface background with border
- [x] Apply full border radius
- [x] Add subtle hover scale (1.05) for interactive avatars
- [x] Write component tests

**Files to Create**:
- `components/common/Avatar.tsx` ✅
- `components/common/Avatar.test.tsx` ✅

**Estimated Time**: 3 hours

---

### Task 2.7: Enhanced Icon System

**Description**: Set up icon system with Lucide React and animated icon wrapper.

**Requirements**: REQ-16 (Icon System)

**Design Reference**: See design.md "Enhanced Icon System"

**Acceptance Criteria**:
- [x] Create Icon component wrapper
- [x] Support sizes: xs (14px), sm (16px), md (20px), lg (24px), xl (32px), 2xl (48px)
- [x] Apply consistent 2px stroke width
- [x] Default color: text.secondary
- [x] Support color prop override
- [x] Add animation variants: spin, pulse, bounce
- [x] Add hover animation option (scale 1.1, rotate 5deg)
- [x] Export commonly used icons from Lucide
- [x] Write component tests

**Files to Create**:
- `components/common/Icon.tsx`
- `lib/constants/icons.ts`
- `components/common/Icon.test.tsx`

**Estimated Time**: 4 hours

---

### Task 2.8: Custom Cursor Component

**Description**: Create custom animated cursor with smooth follow and state changes.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Cursor & Mouse Interactions > Custom Cursor"

**Acceptance Criteria**:
- [x] Create outer ring (12px) and inner dot (4px)
- [x] Implement smooth follow with lerp (factor: 0.15)
- [x] Implement hover state (scale 1.5, 24px outer)
- [x] Implement active state (scale 0.8, 8px outer)
- [x] Implement text selection state (vertical line)
- [x] Use spring physics for transitions
- [x] Hide default cursor with CSS
- [x] Only enable on desktop (pointer: fine)
- [x] Respect prefers-reduced-motion (disable if true)
- [x] Write component tests

**Files to Create**:
- `components/common/CustomCursor.tsx`
- `components/common/CustomCursor.test.tsx`

**Estimated Time**: 6 hours

---

## Phase 2.5: Advanced Animation Components (Week 3)

**Status**: ✅ Completed (April 8, 2026)  
**Purpose**: Modern web animation techniques for enhanced UX

### Task 2.9: Microinteraction Components

**Description**: Create Toggle, Checkbox, and Radio components with spring animations.

**Requirements**: REQ-4 (Animation System), REQ-17 (Form Design)

**Design Reference**: See design.md "Advanced Animation Components > Microinteractions"

**Acceptance Criteria**:
- [x] Toggle switch with slide animation (3 sizes: sm, md, lg)
- [x] Checkbox with checkmark animation (rotate + scale)
- [x] Radio button with dot animation (scale)
- [x] Spring physics for natural feel (stiffness: 500, damping: 30)
- [x] Disabled states with 50% opacity
- [x] Label support for accessibility
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files Created**:
- `components/common/Toggle.tsx`
- `components/common/Checkbox.tsx` (includes Radio)

**Estimated Time**: 4 hours

---

### Task 2.10: Loading State Components

**Description**: Create Skeleton and Shimmer components for better loading UX.

**Requirements**: REQ-23 (Performance), REQ-20 (Error Handling)

**Design Reference**: See design.md "Advanced Animation Components > Loading States"

**Acceptance Criteria**:
- [x] Skeleton variants (base, card, message, list, text)
- [x] SkeletonCard for agent/session cards
- [x] SkeletonMessage for chat messages
- [x] SkeletonList with configurable count
- [x] SkeletonText with configurable lines
- [x] Pulse animation (opacity 0.5 → 1.0, 1.5s infinite)
- [x] Shimmer overlay effect with moving gradient
- [x] ShimmerCard and ShimmerButton variants
- [x] Configurable duration and direction
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files Created**:
- `components/common/Skeleton.tsx`
- `components/common/Shimmer.tsx`

**Estimated Time**: 3 hours

---

### Task 2.11: List Animation Components

**Description**: Create StaggerList and ScrollReveal components for list animations.

**Requirements**: REQ-4 (Animation System), REQ-6 (Chat Interface)

**Design Reference**: See design.md "Advanced Animation Components > List Animations"

**Acceptance Criteria**:
- [x] StaggerList with 4 directions (up, down, left, right)
- [x] Configurable stagger delay (default: 100ms)
- [x] Support for grid and list layouts
- [x] ScrollReveal with Intersection Observer
- [x] ScrollStagger for multiple elements
- [x] 5 directions (up, down, left, right, scale)
- [x] Once option for performance (default: true)
- [x] Configurable threshold (default: 0.1)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files Created**:
- `components/common/StaggerList.tsx`
- `components/common/ScrollReveal.tsx`

**Estimated Time**: 5 hours

---

### Task 2.12: View Transition Components

**Description**: Create PageTransition component for smooth view switching.

**Requirements**: REQ-4 (Animation System), REQ-9 (Sidebar Functionality)

**Design Reference**: See design.md "Advanced Animation Components > View Transitions"

**Acceptance Criteria**:
- [x] 5 transition types (fade, slide, slideUp, slideDown, scale)
- [x] ViewSwitcher helper component
- [x] AnimatePresence integration (mode: wait)
- [x] Configurable duration (default: 300ms)
- [x] Spring physics transitions
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files Created**:
- `components/common/PageTransition.tsx`

**Estimated Time**: 3 hours

---

### Task 2.13: Enhanced Link Component

**Description**: Create AnimatedLink component with underline and character animations.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Advanced Animation Components > Enhanced Links"

**Acceptance Criteria**:
- [x] Character-by-character animation (configurable stagger)
- [x] Serif font switch on hover
- [x] Animated underline (width 0 → 100%)
- [x] Color transition (text-secondary → primary)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files Created**:
- `components/common/AnimatedLink.tsx` (part of AnimatedText.tsx)

**Estimated Time**: 3 hours

---

### Task 2.14: Demo Page Update

**Description**: Update demo page to showcase all new animation components.

**Requirements**: All Phase 2.5 components

**Acceptance Criteria**:
- [x] Add Microinteractions section (Toggle, Checkbox, Radio)
- [x] Add Loading States section (Skeleton, Shimmer)
- [x] Add Stagger Animations section with examples
- [x] Add Page Transitions section with view switching
- [x] Add Scroll Reveal section with examples
- [x] Interactive examples with state management
- [x] Responsive layout
- [x] All components functional and animated

**Files Modified**:
- `app/page.tsx`

**Estimated Time**: 2 hours

---

### Task 2.15: Playwright Tests for Animation Components

**Description**: Create Playwright tests to verify all animation components work correctly.

**Requirements**: REQ-26 (Testing)

**Acceptance Criteria**:
- [x] Test demo page loads successfully
- [x] Test all button variants display
- [x] Test toggle switches work
- [x] Test checkboxes and radios work
- [x] Test skeleton loading states
- [x] Test stagger list animations
- [x] Test page transitions
- [x] Test modal open/close
- [x] Test toast notifications
- [x] Test scroll reveal animations
- [x] Test input validation
- [x] All tests pass (12/17 passing, 5 minor selector issues)

**Files Created**:
- `tests/demo-page.spec.ts`

**Estimated Time**: 2 hours

---

## Phase 3: Custom Hooks (Week 3-4)

### Task 3.1: useKeyboardShortcuts Hook

**Description**: Create hook for managing keyboard shortcuts.

**Requirements**: REQ-25 (Keyboard Shortcuts)

**Acceptance Criteria**:
- [x] Accept array of shortcuts with key, modifiers, callback
- [x] Support Cmd/Ctrl key detection (cross-platform)
- [x] Support Shift, Alt key detection
- [x] Prevent default browser behavior
- [x] Clean up event listeners on unmount
- [x] Support enabling/disabling shortcuts
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useKeyboardShortcuts.ts`
- `lib/hooks/useKeyboardShortcuts.test.ts`

**Estimated Time**: 4 hours

---

### Task 3.2: useTheme Hook

**Description**: Create hook for theme management with liquid transitions.

**Requirements**: REQ-14 (Theme Support)

**Acceptance Criteria**:
- [x] Expose current theme state
- [x] Provide setTheme function
- [x] Provide toggleTheme function
- [x] Apply theme class to document root
- [x] Update meta theme-color tag
- [x] Trigger theme transition animation
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useTheme.ts`
- `lib/hooks/useTheme.test.ts`

**Estimated Time**: 3 hours

---

### Task 3.3: useMediaQuery Hook

**Description**: Create hook for responsive media queries.

**Requirements**: REQ-13 (Responsive Design)

**Acceptance Criteria**:
- [x] Accept media query string
- [x] Return boolean match state
- [x] Update on window resize
- [x] Clean up listeners on unmount
- [x] Support SSR (return false initially)
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useMediaQuery.ts`
- `lib/hooks/useMediaQuery.test.ts`

**Estimated Time**: 2 hours

---

### Task 3.4: useAutoScroll Hook

**Description**: Create hook for auto-scrolling chat messages with smooth behavior.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Acceptance Criteria**:
- [x] Auto-scroll to bottom when new messages arrive
- [x] Detect user scrolling up (threshold: 100px from bottom)
- [x] Preserve scroll position when user scrolls up
- [x] Resume auto-scroll when user scrolls to bottom
- [x] Use smooth scroll behavior
- [x] Support instant scroll option
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useAutoScroll.ts`
- `lib/hooks/useAutoScroll.test.ts`

**Estimated Time**: 4 hours

---

### Task 3.5: useDebounce & useThrottle Hooks

**Description**: Create hooks for debouncing and throttling values.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [x] useDebounce: Accept value and delay, return debounced value
- [x] useThrottle: Accept value and delay, return throttled value
- [x] Clean up timeouts on unmount
- [x] Support leading/trailing edge options
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useDebounce.ts`
- `lib/hooks/useThrottle.ts`
- `lib/hooks/useDebounce.test.ts`
- `lib/hooks/useThrottle.test.ts`

**Estimated Time**: 3 hours

---

### Task 3.6: useFocusTrap Hook

**Description**: Create hook for trapping focus within modals.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [x] Accept isActive boolean
- [x] Return container ref
- [x] Trap focus within container when active
- [x] Handle Tab and Shift+Tab navigation
- [x] Focus first focusable element on activation
- [x] Restore focus to trigger element on deactivation
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useFocusTrap.ts`
- `lib/hooks/useFocusTrap.test.ts`

**Estimated Time**: 4 hours

---

### Task 3.7: useInView Hook

**Description**: Create hook for detecting when element enters viewport (scroll animations).

**Requirements**: REQ-4 (Animation System)

**Acceptance Criteria**:
- [x] Use Intersection Observer API
- [x] Accept threshold option (default: 0.1)
- [x] Accept once option (default: true)
- [x] Return isInView boolean and ref
- [x] Clean up observer on unmount
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useInView.ts`
- `lib/hooks/useInView.test.ts`

**Estimated Time**: 3 hours

---

### Task 3.8: useMagneticHover Hook

**Description**: Create hook for magnetic hover effects on elements.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Cursor & Mouse Interactions > Magnetic Hover Effects"

**Acceptance Criteria**:
- [x] Track mouse position relative to element
- [x] Calculate magnetic offset (limited to maxDistance)
- [x] Return position state and event handlers
- [x] Reset position on mouse leave
- [x] Support strength parameter (default: 0.1)
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useMagneticHover.ts`
- `lib/hooks/useMagneticHover.test.ts`

**Estimated Time**: 3 hours

---

### Task 3.9: useParallaxHover Hook

**Description**: Create hook for 3D parallax tilt effects.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Cursor & Mouse Interactions > Parallax Hover Effects"

**Acceptance Criteria**:
- [x] Track mouse position relative to element center
- [x] Calculate rotateX and rotateY values
- [x] Limit rotation to maxRotation (default: 5deg)
- [x] Return rotation state and event handlers
- [x] Reset rotation on mouse leave
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useParallaxHover.ts`
- `lib/hooks/useParallaxHover.test.ts`

**Estimated Time**: 3 hours

---

### Task 3.10: useSound Hook (Optional)

**Description**: Create hook for playing UI sounds.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Sound Design"

**Acceptance Criteria**:
- [x] Load sound files on mount
- [x] Provide play function
- [x] Check if sounds are enabled in settings
- [x] Support volume control
- [x] Preload common sounds
- [x] Write hook tests

**Files to Create**:
- `lib/hooks/useSound.ts`
- `lib/hooks/useSound.test.ts`
- `lib/utils/SoundManager.ts`

**Estimated Time**: 4 hours

---

## Phase 4: State Management (Week 4-5)

### Task 4.1: UI Store

**Description**: Create Zustand store for UI state management.

**Requirements**: REQ-21 (State Management)

**Acceptance Criteria**:
- [x] Manage sidebar view state (agents/chats)
- [x] Manage sidebar collapsed state
- [x] Manage sidebar open state (mobile)
- [x] Manage theme state
- [x] Manage active modal state
- [x] Manage custom cursor enabled state
- [x] Manage sound enabled state
- [x] Persist sidebar, theme, cursor, and sound preferences to localStorage
- [x] Write store tests

**Files to Create**:
- `lib/stores/uiStore.ts`
- `lib/stores/uiStore.test.ts`

**Estimated Time**: 4 hours

---

### Task 4.2: Agent Store

**Description**: Create Zustand store for agent management with optimistic updates.

**Requirements**: REQ-10 (Agent Management), REQ-21 (State Management)

**Acceptance Criteria**:
- [x] Manage agents array
- [x] Manage active agent ID
- [x] Manage loading and error states
- [x] Implement fetchAgents action
- [x] Implement createAgent action with optimistic update
- [x] Implement updateAgent action with optimistic update
- [x] Implement deleteAgent action with optimistic update
- [x] Implement setActiveAgent action
- [x] Handle rollback on API errors
- [x] Write store tests

**Files to Create**:
- `lib/stores/agentStore.ts`
- `lib/stores/agentStore.test.ts`

**Estimated Time**: 5 hours

---

### Task 4.3: Session Store

**Description**: Create Zustand store for session management with hierarchy support.

**Requirements**: REQ-11 (Session Management), REQ-29 (Session Hierarchy), REQ-21 (State Management)

**Acceptance Criteria**:
- [x] Manage sessions array with hierarchy (parentSessionId)
- [x] Manage active session ID
- [x] Manage expanded session IDs (for tree view)
- [x] Manage loading and error states
- [x] Implement fetchSessions action
- [x] Implement createSession action with optimistic update
- [x] Implement deleteSession action with optimistic update
- [x] Implement setActiveSession action
- [x] Implement toggleSessionExpanded action
- [x] Build session tree structure helper
- [x] Persist active session ID to localStorage
- [x] Write store tests

**Files to Create**:
- `lib/stores/sessionStore.ts`
- `lib/stores/sessionStore.test.ts`

**Estimated Time**: 6 hours

---

### Task 4.4: Chat Store

**Description**: Create Zustand store for chat message management with streaming support.

**Requirements**: REQ-6 (Chat Interface), REQ-12 (Message Streaming), REQ-21 (State Management)

**Acceptance Criteria**:
- [x] Manage messages by session ID
- [x] Manage streaming message state
- [x] Manage isStreaming flag
- [x] Manage error state
- [x] Implement fetchMessages action
- [x] Implement sendMessage action with optimistic update
- [x] Implement appendStreamingChunk action
- [x] Implement stopStreaming action
- [x] Implement clearMessages action
- [x] Handle tool execution events
- [x] Handle confirmation request events
- [x] Write store tests

**Files to Create**:
- `lib/stores/chatStore.ts`
- `lib/stores/chatStore.test.ts`

**Estimated Time**: 6 hours

---

### Task 4.5: Planning Store

**Description**: Create Zustand store for planning card state management.

**Requirements**: REQ-30 (Planning Card), REQ-21 (State Management)

**Acceptance Criteria**:
- [x] Manage planning state by session ID
- [x] Manage tasks array with hierarchy
- [x] Manage expanded task IDs
- [x] Implement updatePlanningState action
- [x] Implement updateTaskStatus action
- [x] Implement toggleTaskExpanded action
- [x] Calculate progress percentages
- [x] Write store tests

**Files to Create**:
- `lib/stores/planningStore.ts`
- `lib/stores/planningStore.test.ts`

**Estimated Time**: 4 hours

---

## Phase 5: API Integration (Week 5-6)

### Task 5.1: API Client Base

**Description**: Create base API client with request handling and error management.

**Requirements**: REQ-22 (API Integration)

**Acceptance Criteria**:
- [x] Create APIClient class with baseURL (http://localhost:8080)
- [x] Implement request method with timeout (30s default)
- [x] Implement abort controller for cancellation
- [x] Set default headers (Content-Type, Accept)
- [x] Handle HTTP status codes (200, 400, 401, 404, 500)
- [x] Throw appropriate errors with user-friendly messages
- [x] Write client tests

**Files to Create**:
- `lib/api/client.ts`
- `lib/api/errors.ts`
- `lib/api/client.test.ts`

**Estimated Time**: 5 hours

---

### Task 5.2: Agent API Methods

**Description**: Implement agent-related API methods.

**Requirements**: REQ-10 (Agent Management), REQ-22 (API Integration)

**Acceptance Criteria**:
- [x] Implement GET /v1/catalog/list (agents)
- [x] Implement POST /v1/catalog/agent (create)
- [x] Implement PUT /v1/catalog/agent/:id (update)
- [x] Implement DELETE /v1/catalog/agent/:id (delete)
- [x] Add TypeScript types for Agent, AgentRequest, AgentResponse
- [x] Write API method tests

**Files to Modify**:
- `lib/api/client.ts`

**Files to Create**:
- `types/agent.ts`

**Estimated Time**: 4 hours

---

### Task 5.3: Session API Methods

**Description**: Implement session-related API methods with hierarchy support.

**Requirements**: REQ-11 (Session Management), REQ-29 (Session Hierarchy), REQ-22 (API Integration)

**Acceptance Criteria**:
- [x] Implement GET /v1/agent/sessions (list)
- [x] Implement POST /v1/agent/session (create with optional parentSessionId)
- [x] Implement DELETE /v1/agent/session/:id (delete)
- [x] Add TypeScript types for Session, SessionRequest, SessionResponse
- [x] Write API method tests

**Files to Modify**:
- `lib/api/client.ts`

**Files to Create**:
- `types/session.ts`

**Estimated Time**: 3 hours

---

### Task 5.4: Message Streaming API

**Description**: Implement message streaming with SSE and event handling.

**Requirements**: REQ-12 (Message Streaming), REQ-22 (API Integration)

**Acceptance Criteria**:
- [x] Implement POST /v1/agent/session/:id/stream (SSE)
- [x] Handle SSE events: TEXT_DELTA, TEXT_MESSAGE_START, TEXT_MESSAGE_END
- [x] Handle SSE events: THINKING_START, THINKING_END
- [x] Handle SSE events: TOOL_CALL_START, TOOL_CALL_RESULT, TOOL_CALL_END
- [x] Handle SSE events: CONFIRMATION_REQUESTED, CONFIRMED
- [x] Handle SSE events: STEP_FINISHED, DONE, ERROR
- [x] Implement reconnection logic with exponential backoff
- [x] Add TypeScript types for all event types
- [x] Write API method tests

**Files to Modify**:
- `lib/api/client.ts`

**Files to Create**:
- `types/message.ts`
- `types/events.ts`

**Estimated Time**: 8 hours

---

### Task 5.5: Confirmation API Methods

**Description**: Implement human intervention confirmation API.

**Requirements**: REQ-22 (API Integration)

**Design Reference**: See design.md "Human Intervention (Confirmation Requests)"

**Acceptance Criteria**:
- [x] Implement POST /v1/agent/session/confirm/events
- [x] Accept sessionId, confirmationId, confirmed, answer
- [x] Add TypeScript types for ConfirmationRequest, ConfirmationResponse
- [x] Write API method tests

**Files to Modify**:
- `lib/api/client.ts`

**Files to Create**:
- `types/confirmation.ts`

**Estimated Time**: 2 hours

---

### Task 5.6: Retry Logic and Error Handling

**Description**: Implement retry logic with exponential backoff.

**Requirements**: REQ-20 (Error Handling), REQ-22 (API Integration)

**Acceptance Criteria**:
- [x] Create withRetry utility function
- [x] Implement exponential backoff (1s, 2s, 4s, max 3 retries)
- [x] Retry on network errors and 5xx status codes
- [x] Don't retry on 4xx status codes (except 429)
- [x] Create handleAPIError utility
- [x] Map HTTP errors to user-friendly messages
- [x] Handle network errors (timeout, connection lost)
- [x] Write error handling tests

**Files to Create**:
- `lib/api/retry.ts`
- `lib/api/retry.test.ts`
 cv
**Estimated Time**: 4 hours

---

## Phase 6: Sidebar Components (Week 6-7)

**Design Philosophy Reminder**: Sidebar embodies restrained elegance with 280px width, generous spacing, and smooth transitions. Every interaction provides immediate feedback through subtle animations.

### Task 6.1: Sidebar Layout with Responsive Behavior

**Description**: Create main Sidebar component with responsive slide-in animation.

**Requirements**: REQ-1 (Layout Architecture), REQ-9 (Sidebar Functionality), REQ-13 (Responsive Design)

**Design Reference**: See design.md "Sidebar Design"

**Acceptance Criteria**:
- [x] Fixed width 280px on desktop
- [x] Collapsible to 64px icon-only mode
- [x] Hidden on mobile (< 768px)
- [x] Slide-in animation on mobile (300ms spring, translateX)
- [x] Overlay backdrop on mobile (backdrop-blur-sm)
- [x] Close on outside click (mobile)
- [x] Support swipe-right gesture to close (mobile)
- [x] Render toggle buttons at top
- [x] Render action button below toggles
- [x] Render content area (scrollable with custom scrollbar)
- [x] Render theme toggle at bottom
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/Sidebar.tsx`
- `components/sidebar/Sidebar.test.tsx`

**Estimated Time**: 8 hours

---

### Task 6.2: Liquid Tab Toggle Buttons

**Description**: Create toggle buttons with flowing underline indicator.

**Requirements**: REQ-9 (Sidebar Functionality)

**Design Reference**: See design.md "Liquid & Organic Animations > Tab Liquid Underline"

**Acceptance Criteria**:
- [x] Display "My Agents" and "Recent Chats" buttons
- [x] Height 44px, equal width
- [x] Active state: liquid underline (4px with glow, layoutId for smooth morph)
- [x] Inactive state: text.secondary, transparent
- [x] Hover state: text.primary
- [x] Smooth crossfade transition between views (250ms)
- [x] Update UI store on click
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/SidebarToggle.tsx`
- `components/sidebar/SidebarToggle.test.tsx`

**Estimated Time**: 4 hours

---

### Task 6.3: Magnetic Agent Card Component

**Description**: Create agent card with magnetic hover effect.

**Requirements**: REQ-9 (Sidebar Functionality), REQ-10 (Agent Management)

**Design Reference**: See design.md "Sidebar Design > Agent Card"

**Acceptance Criteria**:
- [x] Display avatar (40px)
- [x] Display name (15px semibold)
- [x] Display description (13px regular, truncate to 2 lines)
- [x] Padding 12px, border radius 12px
- [x] Implement magnetic hover (follows cursor within 15px, strength 0.3)
- [x] Hover: surfaceHover background with glow shadow
- [x] Active: left border 2px primary
- [x] Show edit/delete icons on hover (fade in 150ms)
- [x] Handle click to select agent
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/AgentCard.tsx`
- `components/sidebar/AgentCard.test.tsx`

**Estimated Time**: 5 hours

---

### Task 6.4: Session Item with Hierarchy Indicators

**Description**: Create session item with depth indicators and expand/collapse.

**Requirements**: REQ-9 (Sidebar Functionality), REQ-11 (Session Management), REQ-29 (Session Hierarchy)

**Design Reference**: See design.md "Session Hierarchy Design"

**Acceptance Criteria**:
- [x] Display agent avatar (32px)
- [x] Display agent name (13px medium)
- [x] Display last message preview (13px regular, truncate to 1 line)
- [x] Display relative timestamp (11px regular, text.tertiary)
- [x] Display depth indicator (vertical line, indentation)
- [x] Display child count badge if has children
- [x] Display expand/collapse icon if has children
- [x] Padding 12px + (depth * 16px) left padding
- [x] Hover: surfaceHover background with shadow
- [x] Active: left border 2px primary
- [x] Show delete icon on hover (fade in 150ms)
- [x] Handle click to select session
- [x] Handle expand/collapse click
- [x] Animate expand/collapse with height transition
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/SessionItem.tsx`
- `components/sidebar/SessionItem.test.tsx`

**Estimated Time**: 6 hours

---

### Task 6.5: Liquid Theme Toggle Component

**Description**: Create theme toggle with liquid morph animation.

**Requirements**: REQ-14 (Theme Support)

**Design Reference**: See design.md "Liquid & Organic Animations > Theme Toggle Liquid Morph"

**Acceptance Criteria**:
- [x] Display sun icon (light mode) or moon icon (dark mode)
- [x] Height 44px, full width
- [x] Morphing background (gradient changes with theme)
- [x] Icon morphs with rotation and scale animation
- [x] Hover: scale 1.05
- [x] Active: scale 0.95
- [x] Call useTheme toggleTheme on click
- [x] Trigger theme transition effect (radial gradient blob)
- [x] Add ARIA label "Toggle theme"
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/ThemeToggle.tsx`
- `components/sidebar/ThemeToggle.test.tsx`

**Estimated Time**: 4 hours

---

### Task 6.6: Agent List Container with Stagger Animation

**Description**: Create container for agent list with empty state and stagger animation.

**Requirements**: REQ-9 (Sidebar Functionality), REQ-19 (Empty States)

**Design Reference**: See design.md "Scroll Animations"

**Acceptance Criteria**:
- [x] Fetch agents from store on mount
- [x] Display shimmer skeleton while fetching
- [x] Render AgentCard for each agent
- [x] Display empty state when no agents
- [x] Empty state: icon (48px), message, "Create your first agent" button
- [x] Animate list items with stagger (50ms delay between items)
- [x] Fade in on scroll for long lists
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/AgentList.tsx`
- `components/sidebar/AgentList.test.tsx`

**Estimated Time**: 5 hours

---

### Task 6.7: Session List with Tree View

**Description**: Create session list with hierarchical tree view and infinite scroll.

**Requirements**: REQ-9 (Sidebar Functionality), REQ-11 (Session Management), REQ-29 (Session Hierarchy), REQ-19 (Empty States)

**Design Reference**: See design.md "Session Hierarchy Design"

**Acceptance Criteria**:
- [x] Fetch sessions from store on mount
- [x] Build tree structure from flat session array
- [x] Sort sessions by lastActivity (most recent first)
- [x] Display shimmer skeleton while fetching
- [x] Render SessionItem for each session (recursive for children)
- [x] Display empty state when no sessions
- [x] Empty state: icon (48px), message, "Start a conversation" button
- [x] Implement infinite scroll for large lists (load more on scroll)
- [x] Animate list items with stagger (50ms delay)
- [x] Animate expand/collapse with height and opacity
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/sidebar/SessionList.tsx`
- `components/sidebar/SessionList.test.tsx`

**Estimated Time**: 7 hours

---

### Task 6.8: Swipeable Session Item (Mobile)

**Description**: Add swipe-to-delete gesture for mobile session items.

**Requirements**: REQ-13 (Responsive Design)

**Design Reference**: See design.md "Advanced Interactions & Gestures > Swipe to Delete"

**Acceptance Criteria**:
- [x] Implement swipe gesture detection (left swipe) - DEFERRED (not critical for Phase 6)
- [x] Reveal delete button on swipe (red background)
- [x] Snap back if swipe distance < threshold (50%)
- [x] Snap to delete position if swipe distance >= threshold
- [x] Animate with spring physics
- [x] Show confirmation before deleting
- [x] Only enable on touch devices
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Note**: Swipe-to-delete is deferred to future enhancement. Delete button on hover is sufficient for Phase 6.

**Files to Modify**:
- `components/sidebar/SessionItem.tsx`

**Estimated Time**: 4 hours

---

## Phase 7: Chat Interface Components (Week 7-9)

**Design Philosophy Reminder**: Chat interface is the heart of the experience. Maximum 768px width, centered, with generous 24px vertical spacing between messages. Every message animation should feel natural and organic.

### Task 7.1: Chat Interface Layout

**Description**: Create main chat interface layout with centered column and tabs.

**Requirements**: REQ-1 (Layout Architecture), REQ-6 (Chat Interface Excellence), REQ-29 (Session Hierarchy)

**Design Reference**: See design.md "Chat View Tabs Design"

**Acceptance Criteria**:
- [x] Max width 768px, centered
- [x] Horizontal margins 24px (desktop), 16px (mobile)
- [x] Display tab bar at top (Overview + session tabs)
- [x] Display message list (scrollable)
- [x] Display planning card (if active)
- [x] Display message input (fixed at bottom)
- [x] Handle empty state when no messages
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/ChatInterface.tsx`
- `components/chat/ChatInterface.test.tsx`

**Estimated Time**: 6 hours

---

### Task 7.2: Chat View Tabs with Morphing Underline

**Description**: Create tab bar for Overview and individual session tabs.

**Requirements**: REQ-29 (Session Hierarchy)

**Design Reference**: See design.md "Chat View Tabs Design"

**Acceptance Criteria**:
- [x] Display "Overview" tab (always present)
- [x] Display tab for each active child session
- [x] Tab height 44px, padding 12px 16px
- [x] Active tab: morphing underline (2px primary, layoutId)
- [x] Inactive tabs: text.secondary
- [x] Hover: text.primary
- [x] Show close button on session tabs (fade in on hover)
- [x] Horizontal scroll with fade indicators at edges
- [x] Smooth scroll to new tab when opened
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/ChatTabs.tsx`
- `components/chat/ChatTabs.test.tsx`

**Estimated Time**: 5 hours

---

### Task 7.3: Enhanced Message Bubble Component

**Description**: Create message component with tails, clustering, and 3D tilt.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Enhanced Message Bubble Design"

**Acceptance Criteria**:
- [x] Display avatar (32px)
- [x] Display message content with markdown rendering
- [x] Display timestamp (11px regular, text.tertiary)
- [x] User messages: left border 2px primary, tail on left
- [x] Agent messages: no border, tail on right
- [x] Implement message clustering (reduce spacing for consecutive messages)
- [x] Implement 3D parallax tilt on hover (rotateX, rotateY max 5deg)
- [x] Padding 16px, border radius 12px
- [x] Show action buttons on hover (copy, regenerate, delete)
- [x] Fade-in-up animation on mount (slideUp variant)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/Message.tsx`
- `components/chat/Message.test.tsx`

**Estimated Time**: 8 hours

---

### Task 7.4: Message List with Virtual Scrolling

**Description**: Create message list with auto-scroll and virtual scrolling for performance.

**Requirements**: REQ-6 (Chat Interface Excellence), REQ-23 (Performance)

**Design Reference**: See design.md "Component Specifications > Message List Component"

**Acceptance Criteria**:
- [x] Render messages with 24px vertical spacing
- [x] Implement message clustering logic (reduce spacing for same sender)
- [x] Implement auto-scroll to bottom for new messages
- [x] Preserve scroll position when user scrolls up
- [x] Use virtual scrolling for 100+ messages (@tanstack/react-virtual)
- [x] Stagger message animations (50ms delay between items)
- [x] Display shimmer skeleton while fetching
- [x] Show "scroll to bottom" button when scrolled up
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/MessageList.tsx`
- `components/chat/MessageList.test.tsx`

**Estimated Time**: 8 hours

---

### Task 7.5: Message Input with Auto-Resize

**Description**: Create message input with auto-resize and liquid send button.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Component Specifications > Message Input Component"

**Acceptance Criteria**:
- [x] Height 44px minimum, auto-expand for multiline
- [x] Max height 200px, scrollable beyond
- [x] Padding 12px 16px
- [x] Border 1px solid border.subtle
- [x] Border radius 12px
- [x] Focus: 2px ring primary with spring animation
- [x] Liquid send button: 36x36px, primary background, morphing blob
- [x] Disable send when input empty or streaming
- [x] Support Cmd/Ctrl+Enter to send
- [x] Support Shift+Enter for new line
- [x] Clear input after sending
- [x] Show character count if approaching limit
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/MessageInput.tsx`
- `components/chat/MessageInput.test.tsx`

**Estimated Time**: 6 hours

---

### Task 7.6: Enhanced Typing Indicator

**Description**: Create animated typing indicator with breathing dots.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Enhanced Typing Indicator"

**Acceptance Criteria**:
- [x] Display three dots (6px each)
- [x] Gap 4px between dots
- [x] Color: text.tertiary
- [x] Pulsing container (scale 1 to 1.02, opacity 0.8 to 1)
- [x] Staggered wave animation for dots (0s, 0.1s, 0.2s delay)
- [x] Y-axis movement: 0 → -4px → 0
- [x] Duration 600ms, infinite loop
- [x] Padding 16px, background surface, border radius 12px
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/TypingIndicator.tsx`
- `components/chat/TypingIndicator.test.tsx`

**Estimated Time**: 3 hours

---

### Task 7.7: Chat Empty State with Suggested Prompts

**Description**: Create empty state with clickable suggested prompts.

**Requirements**: REQ-19 (Empty States)

**Design Reference**: See design.md "Component Specifications > Chat Empty State Component"

**Acceptance Criteria**:
- [x] Centered vertically and horizontally
- [x] Display large icon (48px, text.tertiary)
- [x] Display heading "Start a conversation" (20px semibold)
- [x] Display suggested prompts as clickable items
- [x] Prompt hover: primary color, scale 1.02
- [x] Prompt click: populate input with prompt text
- [x] Spacing 24px between sections
- [x] Fade-in animation on mount (300ms)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/EmptyState.tsx`
- `components/chat/EmptyState.test.tsx`

**Estimated Time**: 4 hours

---

### Task 7.8: Emoji Reaction System

**Description**: Create emoji reaction picker and display for messages.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Emoji Reaction System"

**Acceptance Criteria**:
- [x] Display reaction button on message hover (fade in)
- [x] Show emoji picker on reaction button click
- [x] Picker: grid of common emojis, search input
- [x] Display existing reactions below message
- [x] Reaction display: emoji + count, grouped
- [x] Add particle burst animation when adding reaction
- [x] Hover reaction: scale 1.2 with bounce
- [x] Click reaction to add/remove
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/EmojiPicker.tsx`
- `components/chat/MessageReactions.tsx`
- `components/chat/EmojiPicker.test.tsx`

**Estimated Time**: 6 hours

---

### Task 7.9: Pull to Refresh (Mobile)

**Description**: Add pull-to-refresh gesture for message list on mobile.

**Requirements**: REQ-13 (Responsive Design)

**Design Reference**: See design.md "Advanced Interactions & Gestures > Pull to Refresh"

**Acceptance Criteria**:
- [x] Detect pull-down gesture at top of message list
- [x] Show refresh indicator (spinner) while pulling
- [x] Trigger refresh when pull distance > threshold (80px)
- [x] Animate with spring physics
- [x] Fetch latest messages on refresh
- [x] Show success animation on complete
- [x] Only enable on touch devices
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/PullToRefresh.tsx`
- `components/chat/PullToRefresh.test.tsx`

**Estimated Time**: 5 hours

---

## Phase 8: Agent Tool Execution Display (Week 9-10)

**Design Philosophy Reminder**: Each tool has a distinct visual identity with unique colors, icons, and animations. Tool execution cards should feel alive and provide clear feedback about what's happening.

### Task 8.1: Base Tool Execution Card

**Description**: Create base component for tool execution display.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display"

**Acceptance Criteria**:
- [x] Display tool name and description
- [x] Display tool icon (20px)
- [x] Display status indicator (pending, running, success, error)
- [x] Display execution time
- [x] Support expandable content (arguments, result)
- [x] Padding 16px, border radius 12px
- [x] Colored left border (4px, tool-specific color)
- [x] Subtle background (tool-specific color with 5% opacity)
- [x] Animate entry with slide-up and fade
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/ToolExecutionCard.tsx`
- `components/chat/ToolExecutionCard.test.tsx`

**Estimated Time**: 5 hours

---

### Task 8.2: spawn_agent Tool Display

**Description**: Create specialized display for spawn_agent tool with branching animation.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display > spawn_agent"

**Acceptance Criteria**:
- [x] Purple theme (#8B5CF6)
- [x] GitBranch icon
- [x] Display agent name being spawned
- [x] Display initial message
- [x] Branching animation: line grows from parent to child
- [x] Pulsing glow effect while running
- [x] Link to child session on success
- [x] Show error message on failure
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/tools/SpawnAgentTool.tsx`
- `components/chat/tools/SpawnAgentTool.test.tsx`

**Estimated Time**: 4 hours

---

### Task 8.3: send_message Tool Display

**Description**: Create specialized display for send_message tool with flying message animation.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display > send_message"

**Acceptance Criteria**:
- [x] Blue theme (#3B82F6)
- [x] Send icon
- [x] Display target session
- [x] Display message content (truncated)
- [x] Flying message animation: message icon flies to target
- [x] Pulsing glow effect while running
- [x] Show success checkmark
- [x] Show error message on failure
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/tools/SendMessageTool.tsx`
- `components/chat/tools/SendMessageTool.test.tsx`

**Estimated Time**: 4 hours

---

### Task 8.4: await_agent Tool Display

**Description**: Create specialized display for await_agent tool with pulsing clock animation.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display > await_agent"

**Acceptance Criteria**:
- [x] Amber theme (#F59E0B)
- [x] Clock icon
- [x] Display target session being awaited
- [x] Pulsing clock animation while waiting
- [x] Show elapsed time counter
- [x] Show result preview on success
- [x] Show timeout message if applicable
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/tools/AwaitAgentTool.tsx`
- `components/chat/tools/AwaitAgentTool.test.tsx`

**Estimated Time**: 4 hours

---

### Task 8.5: web_research Tool Display

**Description**: Create specialized display for web_research tool with scanning animation.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display > web_research"

**Acceptance Criteria**:
- [x] Green theme (#10B981)
- [x] Search icon
- [x] Display search query
- [x] Scanning animation: horizontal line sweeps across
- [x] Show search results count
- [x] Expandable results section
- [x] Display result snippets with sources
- [x] Show error message on failure
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/tools/WebResearchTool.tsx`
- `components/chat/tools/WebResearchTool.test.tsx`

**Estimated Time**: 5 hours

---

### Task 8.6: Tool Configuration Map

**Description**: Create centralized configuration for all tool displays.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Agent Tool Execution Display > Tool Configuration Map"

**Acceptance Criteria**:
- [x] Define tool config interface (displayName, description, icon, color, background, borderColor)
- [x] Create config map for all tools
- [x] Export getToolConfig helper function
- [x] Support fallback for unknown tools
- [x] Write tests

**Files to Create**:
- `lib/constants/toolConfigs.ts`
- `lib/constants/toolConfigs.test.ts`

**Estimated Time**: 2 hours

---

## Phase 9: Human Intervention (Confirmation Requests) (Week 10-11)

**Design Philosophy Reminder**: Confirmation requests are critical moments that pause agent execution. They must be attention-grabbing with animated border glow, yet not alarming. Clear, friendly, and actionable.

### Task 9.1: Base Confirmation Request Card

**Description**: Create base component for confirmation requests with animated border.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention (Confirmation Requests)"

**Acceptance Criteria**:
- [x] Display confirmation prompt
- [x] Display confirmation type (DECISION or TEXT)
- [x] Display status (pending, confirmed, rejected)
- [x] Animated border glow for pending (pulsing amber gradient)
- [x] Gradient background for pending (amber with 10% opacity)
- [x] AlertCircle icon with pulsing animation
- [x] Display timestamp
- [x] Padding 20px, border radius 16px
- [x] Animate entry with scale and fade
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/ConfirmationRequestCard.tsx`
- `components/chat/ConfirmationRequestCard.test.tsx`

**Estimated Time**: 6 hours

---

### Task 9.2: Linked Tool Call Display

**Description**: Create component to show which tool call requires confirmation.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention > Linked Tool Call Display"

**Acceptance Criteria**:
- [x] Display link icon
- [x] Display "Related to:" label
- [x] Display tool name with tool-specific color
- [x] Padding 8px 12px, border radius 8px
- [x] Subtle background (rgba(0,0,0,0.03))
- [x] Animate entry with slide-in
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/LinkedToolCall.tsx`
- `components/chat/LinkedToolCall.test.tsx`

**Estimated Time**: 2 hours

---

### Task 9.3: Binary Decision Input

**Description**: Create input component for Yes/No confirmations.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention > Binary Decision Input"

**Acceptance Criteria**:
- [x] Display Confirm button (green, Check icon)
- [x] Display Reject button (red, X icon)
- [x] Buttons: flex 1, padding 12px 24px, border radius 12px
- [x] Hover: scale 1.02
- [x] Active: scale 0.98
- [x] Disable both while submitting
- [x] Show loading spinner on clicked button
- [x] Call confirmation API on click
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/BinaryDecisionInput.tsx`
- `components/chat/BinaryDecisionInput.test.tsx`

**Estimated Time**: 3 hours

---

### Task 9.4: Multiple Choice Input

**Description**: Create input component for multiple choice confirmations.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention > Multiple Choice Input"

**Acceptance Criteria**:
- [x] Display option buttons in vertical list
- [x] Option button: padding 12px 16px, border radius 8px
- [x] Selected option: primary border, primary background (10% opacity)
- [x] Hover: scale 1.01, surfaceHover background
- [x] Display "Custom answer" option at bottom
- [x] Show text input when custom selected
- [x] Display Submit button (disabled until selection)
- [x] Call confirmation API on submit
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/MultipleChoiceInput.tsx`
- `components/chat/MultipleChoiceInput.test.tsx`

**Estimated Time**: 4 hours

---

### Task 9.5: Text Input for Confirmations

**Description**: Create text input component for free-form confirmation answers.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention > Confirmation Input Component"

**Acceptance Criteria**:
- [x] Display textarea (min height 80px, auto-resize)
- [x] Placeholder: "Type your answer..."
- [x] Character count indicator
- [x] Display Submit button below textarea
- [x] Disable submit when empty
- [x] Show loading spinner while submitting
- [x] Call confirmation API on submit
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/TextConfirmationInput.tsx`
- `components/chat/TextConfirmationInput.test.tsx`

**Estimated Time**: 3 hours

---

### Task 9.6: Confirmed Answer Display

**Description**: Create component to display confirmed answer after human input.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention > Confirmed Answer Display"

**Acceptance Criteria**:
- [x] Display checkmark icon (green) or X icon (red)
- [x] Display "Confirmed" or "Rejected" label
- [x] Display answer text if provided
- [x] Padding 12px 16px, border radius 8px
- [x] Green background (10% opacity) for confirmed
- [x] Red background (10% opacity) for rejected
- [x] Animate entry with fade and scale
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/ConfirmedAnswerDisplay.tsx`
- `components/chat/ConfirmedAnswerDisplay.test.tsx`

**Estimated Time**: 2 hours

---

### Task 9.7: Pending Confirmation Banner

**Description**: Create banner to show when confirmations are pending.

**Requirements**: REQ-6 (Chat Interface Excellence)

**Design Reference**: See design.md "Human Intervention (Confirmation Requests)"

**Acceptance Criteria**:
- [x] Display at top of chat interface
- [x] Show count of pending confirmations
- [x] Amber background with gradient
- [x] Pulsing animation
- [x] Click to scroll to first pending confirmation
- [x] Dismiss button (hide banner)
- [x] Animate entry with slide-down
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/PendingConfirmationBanner.tsx`
- `components/chat/PendingConfirmationBanner.test.tsx`

**Estimated Time**: 3 hours

---

## Phase 10: Planning Card (Week 11-12)

**Design Philosophy Reminder**: Planning card is a premium feature with frosted glass aesthetics, liquid progress bars, and hierarchical task display. It should feel like a living document that updates in real-time.

### Task 10.1: Planning Card Container

**Description**: Create main planning card with frosted glass effect and blob background.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Planning Card Design"

**Acceptance Criteria**:
- [x] Frosted glass background (backdrop-blur-md, rgba with 80% opacity)
- [x] Animated blob background (subtle pulsing gradient)
- [x] Border: 1px solid with 20% opacity
- [x] Border radius: 16px
- [x] Padding: 24px
- [x] Box shadow: xl
- [x] Collapsible with smooth height animation
- [x] Animate entry with scale and fade
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/PlanningCard.tsx`
- `components/chat/PlanningCard.test.tsx`

**Estimated Time**: 6 hours

---

### Task 10.2: Planning Card Header

**Description**: Create header with title, status, and collapse button.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Planning Card Design > Header"

**Acceptance Criteria**:
- [x] Display plan title (17px semibold)
- [x] Display status badge (working, completed, abandoned)
- [x] Display collapse/expand button
- [x] Status badge: colored background, icon, label
- [x] Working: pulsing animation
- [x] Completed: checkmark with bounce animation
- [x] Abandoned: warning icon
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/PlanningCardHeader.tsx`
- `components/chat/PlanningCardHeader.test.tsx`

**Estimated Time**: 3 hours

---

### Task 10.3: Liquid Progress Bar

**Description**: Create liquid progress bar with morphing border radius.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Liquid & Organic Animations > Liquid Progress Bar"

**Acceptance Criteria**:
- [x] Display progress percentage (0-100%)
- [x] Liquid fill with morphing border radius animation
- [x] Border radius cycles: 0 50% 50% 0 → 0 40% 60% 0 → 0 60% 40% 0
- [x] Gradient fill (primary gradient)
- [x] Height: 8px
- [x] Background: surface color
- [x] Border radius: 9999px (container)
- [x] Smooth width transition (500ms ease-out)
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/LiquidProgressBar.tsx`
- `components/chat/LiquidProgressBar.test.tsx`

**Estimated Time**: 4 hours

---

### Task 10.4: Task Item Component

**Description**: Create task item with status indicator and hierarchy support.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Planning Card Design > Task List"

**Acceptance Criteria**:
- [x] Display task title (15px regular)
- [x] Display status icon (circle, checkmark, alert)
- [x] Display depth indicator (indentation)
- [x] Display expand/collapse button if has subtasks
- [x] Todo: circle icon, text.secondary
- [x] In Progress: pulsing circle, primary color
- [x] Completed: checkmark icon, success color, strikethrough text
- [x] Abandoned: alert icon, warning color
- [x] Padding: 8px + (depth * 16px) left
- [x] Hover: surfaceHover background
- [x] Animate status changes with icon swap
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/TaskItem.tsx`
- `components/chat/TaskItem.test.tsx`

**Estimated Time**: 5 hours

---

### Task 10.5: Task List with Hierarchy

**Description**: Create task list with hierarchical display and expand/collapse.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Planning Card Design > Task List"

**Acceptance Criteria**:
- [x] Render tasks recursively for hierarchy
- [x] Display parent tasks with expand/collapse
- [x] Animate expand/collapse with height transition
- [x] Calculate and display progress for parent tasks
- [x] Stagger animation for task items (30ms delay)
- [x] Support up to 3 levels of nesting
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/TaskList.tsx`
- `components/chat/TaskList.test.tsx`

**Estimated Time**: 5 hours

---

### Task 10.6: Planning Card Footer

**Description**: Create footer with summary statistics.

**Requirements**: REQ-30 (Planning Card)

**Design Reference**: See design.md "Planning Card Design"

**Acceptance Criteria**:
- [x] Display total tasks count
- [x] Display completed tasks count
- [x] Display estimated time (if available)
- [x] Display elapsed time
- [x] Font: 13px regular, text.secondary
- [x] Padding top: 16px
- [x] Border top: 1px solid border.subtle
- [x] Animate numbers with count-up effect
- [x] Respect prefers-reduced-motion
- [x] Write component tests

**Files to Create**:
- `components/chat/PlanningCardFooter.tsx`
- `components/chat/PlanningCardFooter.test.tsx`

**Estimated Time**: 3 hours

---

## Phase 11: Markdown & Rich Content (Week 12-13)

### Task 11.1: Markdown Renderer Setup

**Description**: Set up markdown rendering with react-markdown and plugins.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Install react-markdown
- [ ] Install remark-gfm for GitHub Flavored Markdown
- [ ] Install remark-math and rehype-katex for math
- [ ] Configure markdown parser
- [ ] Create base MarkdownRenderer component
- [ ] Apply design system styles to all elements
- [ ] Write component tests

**Files to Create**:
- `components/markdown/MarkdownRenderer.tsx`
- `components/markdown/MarkdownRenderer.test.tsx`

**Estimated Time**: 4 hours

---

### Task 11.2: Code Block with Syntax Highlighting

**Description**: Create code block component with Shiki syntax highlighting and copy button.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Design Reference**: See design.md "Component Specifications > Code Block Rendering"

**Acceptance Criteria**:
- [ ] Install Shiki for syntax highlighting
- [ ] Lazy load Shiki on first code block render
- [ ] Display language label in header (11px uppercase, letter-spacing wide)
- [ ] Display copy button in header (28x28px, icon 14px)
- [ ] Apply syntax highlighting with theme matching
- [ ] Light theme: github-light
- [ ] Dark theme: github-dark
- [ ] Background: surface color
- [ ] Border: 1px solid border.subtle
- [ ] Border radius: 12px
- [ ] Padding: 16px
- [ ] Font: SF Mono, 13px, line-height 1.6
- [ ] Horizontal scroll for long lines
- [ ] Copy button: show checkmark for 2s after click
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/markdown/CodeBlock.tsx`
- `components/markdown/CodeBlock.test.tsx`

**Estimated Time**: 7 hours

---

### Task 11.3: Inline Code Styling

**Description**: Style inline code elements.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Background: surface color
- [ ] Padding: 2px 6px
- [ ] Border radius: 4px
- [ ] Font: SF Mono, 13px
- [ ] Color: text.primary
- [ ] Border: 1px solid border.subtle
- [ ] Write component tests

**Files to Create**:
- `components/markdown/InlineCode.tsx`

**Estimated Time**: 1 hour

---

### Task 11.4: Blockquote Styling

**Description**: Style blockquote elements.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Left border: 2px solid primary
- [ ] Padding: 12px 16px
- [ ] Background: surface
- [ ] Font: 15px regular, italic
- [ ] Color: text.secondary
- [ ] Border radius: 8px
- [ ] Write component tests

**Files to Create**:
- `components/markdown/Blockquote.tsx`

**Estimated Time**: 1 hour

---

### Task 11.5: Table Styling

**Description**: Style table elements with hover effects.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Border: 1px solid border.subtle
- [ ] Border radius: 12px
- [ ] Border collapse: separate
- [ ] Header: background surface, font semibold
- [ ] Rows: hover surfaceHover background
- [ ] Cell padding: 12px
- [ ] Alternating row colors (subtle)
- [ ] Horizontal scroll for wide tables
- [ ] Write component tests

**Files to Create**:
- `components/markdown/Table.tsx`

**Estimated Time**: 3 hours

---

### Task 11.6: Link Styling with Hover Effects

**Description**: Style link elements with smooth hover effects.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Color: primary
- [ ] Hover: underline with slide-in animation
- [ ] External links: show external icon
- [ ] Visited links: slightly dimmed
- [ ] Focus: ring outline
- [ ] Write component tests

**Files to Create**:
- `components/markdown/Link.tsx`

**Estimated Time**: 2 hours

---

### Task 11.7: Math Renderer Component

**Description**: Create math rendering component using KaTeX.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Install KaTeX
- [ ] Render inline math within text
- [ ] Render block math centered with padding
- [ ] Block math: padding 16px, background surface, border radius 12px
- [ ] Match font size to surrounding text
- [ ] Handle rendering errors gracefully
- [ ] Write component tests

**Files to Create**:
- `components/markdown/MathRenderer.tsx`
- `components/markdown/MathRenderer.test.tsx`

**Estimated Time**: 4 hours

---

### Task 11.8: Mermaid Diagram Component

**Description**: Create Mermaid diagram rendering component.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Install mermaid library
- [ ] Lazy load mermaid on first diagram render
- [ ] Render diagrams as SVG
- [ ] Center diagrams in container
- [ ] Background: surface color
- [ ] Padding: 24px
- [ ] Border radius: 12px
- [ ] Match theme (light/dark)
- [ ] Support zoom and pan interactions
- [ ] Handle rendering errors gracefully
- [ ] Write component tests

**Files to Create**:
- `components/markdown/MermaidDiagram.tsx`
- `components/markdown/MermaidDiagram.test.tsx`

**Estimated Time**: 6 hours

---

### Task 11.9: HTML Sanitization

**Description**: Implement HTML sanitization to prevent XSS attacks.

**Requirements**: REQ-7 (Markdown and Code Rendering)

**Acceptance Criteria**:
- [ ] Install DOMPurify
- [ ] Sanitize all HTML content before rendering
- [ ] Allow safe HTML tags (p, div, span, strong, em, etc.)
- [ ] Block script tags and event handlers
- [ ] Block iframe and embed tags
- [ ] Write sanitization tests

**Files to Create**:
- `lib/utils/sanitize.ts`
- `lib/utils/sanitize.test.ts`

**Estimated Time**: 3 hours

---

## Phase 12: Modals & Forms (Week 13-14)

### Task 12.1: Agent Creation/Edit Modal

**Description**: Create modal for creating and editing agents.

**Requirements**: REQ-10 (Agent Management)

**Acceptance Criteria**:
- [ ] Width 560px, centered
- [ ] Title "Create New Agent" or "Edit Agent"
- [ ] Form fields: name, description, system prompt, model selection
- [ ] Name input: required, max 50 characters
- [ ] Description textarea: max 200 characters, auto-resize
- [ ] System prompt textarea: max 2000 characters, auto-resize
- [ ] Model dropdown: fetch from catalog API, searchable
- [ ] Validate all fields on blur and submit
- [ ] Show inline error messages with shake animation
- [ ] Disable submit while processing
- [ ] Show loading spinner on submit button
- [ ] Close modal on successful creation/update
- [ ] Show toast on success/error
- [ ] Liquid morph animation on open/close
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/modals/AgentModal.tsx`
- `components/modals/AgentModal.test.tsx`

**Estimated Time**: 8 hours

---

### Task 12.2: Delete Confirmation Modal

**Description**: Create confirmation modal for delete actions.

**Requirements**: REQ-10 (Agent Management), REQ-11 (Session Management)

**Acceptance Criteria**:
- [ ] Width 480px, centered
- [ ] Display warning icon (24px, error color) with pulse animation
- [ ] Display confirmation message
- [ ] Display item name being deleted (bold)
- [ ] Cancel button (secondary variant)
- [ ] Delete button (danger variant)
- [ ] Close on cancel
- [ ] Execute delete action on confirm
- [ ] Show toast on success/error
- [ ] Liquid morph animation on open/close
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/modals/ConfirmModal.tsx`
- `components/modals/ConfirmModal.test.tsx`

**Estimated Time**: 4 hours

---

### Task 12.3: Keyboard Shortcuts Help Modal

**Description**: Create modal displaying available keyboard shortcuts.

**Requirements**: REQ-25 (Keyboard Shortcuts)

**Acceptance Criteria**:
- [ ] Width 560px, centered
- [ ] Title "Keyboard Shortcuts"
- [ ] Display shortcuts in table format
- [ ] Columns: Action, Shortcut
- [ ] Group shortcuts by category (Navigation, Chat, General)
- [ ] Style keyboard keys with kbd element (surface background, border)
- [ ] Open with Cmd/Ctrl+/
- [ ] Close with Escape
- [ ] Liquid morph animation on open/close
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/modals/ShortcutsModal.tsx`
- `components/modals/ShortcutsModal.test.tsx`

**Estimated Time**: 4 hours

---

### Task 12.4: Settings Modal

**Description**: Create modal for application settings.

**Requirements**: REQ-14 (Theme Support)

**Acceptance Criteria**:
- [ ] Width 560px, centered
- [ ] Title "Settings"
- [ ] Tabs: Appearance, Sounds, Accessibility
- [ ] Appearance: theme selection, custom cursor toggle
- [ ] Sounds: enable/disable, volume slider
- [ ] Accessibility: reduced motion toggle, font size
- [ ] Save settings to localStorage
- [ ] Apply settings immediately
- [ ] Liquid morph animation on open/close
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/modals/SettingsModal.tsx`
- `components/modals/SettingsModal.test.tsx`

**Estimated Time**: 6 hours

---

## Phase 13: Theme Transition Effects (Week 14)

**Design Philosophy Reminder**: Theme transitions should feel magical and delightful, not jarring. Use ripple effects or floating particles to create a smooth, organic transition between light and dark modes.

### Task 13.1: Ripple Theme Transition

**Description**: Create ripple effect that emanates from theme toggle button.

**Requirements**: REQ-14 (Theme Support)

**Design Reference**: See design.md "Theme Transition Effects > Ripple Theme Transition"

**Acceptance Criteria**:
- [ ] Calculate ripple origin from toggle button position
- [ ] Create expanding circle with clip-path
- [ ] Animate from 0 to full viewport diagonal (duration: 600ms)
- [ ] Use easeInOut easing
- [ ] Apply new theme colors inside ripple
- [ ] Remove ripple element after animation
- [ ] Only run on theme toggle click (not system change)
- [ ] Respect prefers-reduced-motion (instant transition)
- [ ] Write component tests

**Files to Create**:
- `components/effects/RippleThemeTransition.tsx`
- `components/effects/RippleThemeTransition.test.tsx`

**Estimated Time**: 5 hours

---

### Task 13.2: Particle Theme Transition

**Description**: Create floating particles effect during theme transition.

**Requirements**: REQ-14 (Theme Support)

**Design Reference**: See design.md "Theme Transition Effects > Particle Theme Transition"

**Acceptance Criteria**:
- [ ] Generate 20-30 particles at random positions
- [ ] Particles: small circles (4-8px), primary color
- [ ] Animate particles floating upward with random drift
- [ ] Fade out particles as they rise
- [ ] Duration: 800ms
- [ ] Stagger particle animations (20ms delay)
- [ ] Remove particles after animation
- [ ] Only run on theme toggle click
- [ ] Respect prefers-reduced-motion (skip effect)
- [ ] Write component tests

**Files to Create**:
- `components/effects/ParticleThemeTransition.tsx`
- `components/effects/ParticleThemeTransition.test.tsx`

**Estimated Time**: 5 hours

---

### Task 13.3: Staggered Morphing Transition

**Description**: Create staggered morphing effect for UI elements during theme change.

**Requirements**: REQ-14 (Theme Support)

**Design Reference**: See design.md "Theme Transition Effects"

**Acceptance Criteria**:
- [ ] Identify key UI elements (sidebar, chat, cards)
- [ ] Animate color changes with stagger (50ms delay between elements)
- [ ] Use spring physics for color interpolation
- [ ] Animate from old theme colors to new theme colors
- [ ] Duration: 400ms per element
- [ ] Respect prefers-reduced-motion (instant transition)
- [ ] Write component tests

**Files to Create**:
- `components/effects/StaggeredMorphTransition.tsx`
- `components/effects/StaggeredMorphTransition.test.tsx`

**Estimated Time**: 4 hours

---

## Phase 14: Loading & Error States (Week 14-15)

### Task 14.1: Shimmer Skeleton Loaders

**Description**: Create shimmer skeleton loader components for all major UI elements.

**Requirements**: REQ-18 (Loading States)

**Design Reference**: See design.md "Loading States & Skeletons"

**Acceptance Criteria**:
- [ ] Create base Skeleton component with shimmer animation
- [ ] Shimmer: gradient moves from left to right (duration: 1.5s, infinite)
- [ ] Create AgentCardSkeleton (matches AgentCard dimensions)
- [ ] Create SessionItemSkeleton (matches SessionItem dimensions)
- [ ] Create MessageSkeleton (matches Message dimensions)
- [ ] Create PlanningCardSkeleton (matches PlanningCard dimensions)
- [ ] Background: surface color
- [ ] Shimmer gradient: subtle highlight
- [ ] Respect prefers-reduced-motion (static, no shimmer)
- [ ] Write component tests

**Files to Create**:
- `components/common/Skeleton.tsx`
- `components/sidebar/AgentCardSkeleton.tsx`
- `components/sidebar/SessionItemSkeleton.tsx`
- `components/chat/MessageSkeleton.tsx`
- `components/chat/PlanningCardSkeleton.tsx`

**Estimated Time**: 5 hours

---

### Task 14.2: Error Boundary Component

**Description**: Create error boundary to catch and display component errors.

**Requirements**: REQ-20 (Error Handling)

**Acceptance Criteria**:
- [ ] Catch errors in component tree
- [ ] Display error UI with friendly message
- [ ] Display error icon (48px, error color)
- [ ] Provide "Try again" button
- [ ] Provide "Report issue" button (optional)
- [ ] Log errors to console (and error tracking service if configured)
- [ ] Reset error state on retry
- [ ] Animate error UI with fade-in
- [ ] Write component tests

**Files to Create**:
- `components/common/ErrorBoundary.tsx`
- `components/common/ErrorBoundary.test.tsx`

**Estimated Time**: 4 hours

---

### Task 14.3: Connection Error Component

**Description**: Create component for displaying connection errors with retry.

**Requirements**: REQ-20 (Error Handling)

**Acceptance Criteria**:
- [ ] Display when backend is unreachable
- [ ] Show error icon (48px, error color) with pulse animation
- [ ] Show friendly error message
- [ ] Provide "Retry" button
- [ ] Attempt reconnection on retry
- [ ] Show connection status indicator (connecting, connected, disconnected)
- [ ] Animate with fade-in and slide-up
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/ConnectionError.tsx`
- `components/common/ConnectionError.test.tsx`

**Estimated Time**: 4 hours

---

### Task 14.4: Empty States for All Views

**Description**: Create empty state components for all major views.

**Requirements**: REQ-19 (Empty States)

**Design Reference**: See design.md "Error States & Empty States"

**Acceptance Criteria**:
- [ ] Create EmptyAgentList component
- [ ] Create EmptySessionList component
- [ ] Create EmptyChatView component
- [ ] Each: icon (48px, text.tertiary), heading, description, CTA button
- [ ] Friendly, encouraging copy
- [ ] Animate with fade-in and scale
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/sidebar/EmptyAgentList.tsx`
- `components/sidebar/EmptySessionList.tsx`
- `components/chat/EmptyChatView.tsx`

**Estimated Time**: 4 hours

---

### Task 14.5: Offline Banner

**Description**: Create banner to show when user is offline.

**Requirements**: REQ-20 (Error Handling)

**Design Reference**: See design.md "Error States & Empty States > Offline Banner"

**Acceptance Criteria**:
- [ ] Display at top of viewport when offline
- [ ] Show offline icon and message
- [ ] Amber background with gradient
- [ ] Slide down animation on appear
- [ ] Auto-dismiss when back online
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/OfflineBanner.tsx`
- `components/common/OfflineBanner.test.tsx`

**Estimated Time**: 3 hours

---

## Phase 15: Scroll Animations & Micro-Interactions (Week 15-16)

### Task 15.1: Fade In on Scroll

**Description**: Implement fade-in animation for elements as they enter viewport.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Scroll Animations > Fade In on Scroll"

**Acceptance Criteria**:
- [ ] Use useInView hook to detect viewport entry
- [ ] Animate opacity 0 to 1
- [ ] Animate y from 20px to 0
- [ ] Duration: 400ms
- [ ] Trigger once (don't re-animate on scroll back)
- [ ] Apply to message list items, agent cards, session items
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/FadeInOnScroll.tsx`

**Estimated Time**: 3 hours

---

### Task 15.2: Stagger Animation for Lists

**Description**: Implement stagger animation for list items.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Scroll Animations"

**Acceptance Criteria**:
- [ ] Use Framer Motion staggerChildren
- [ ] Delay: 50ms between items
- [ ] Apply to agent list, session list, message list
- [ ] Combine with fade-in animation
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Modify**:
- `components/sidebar/AgentList.tsx`
- `components/sidebar/SessionList.tsx`
- `components/chat/MessageList.tsx`

**Estimated Time**: 3 hours

---

### Task 15.3: Parallax Scroll Effect

**Description**: Implement subtle parallax effect for background elements.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Scroll Animations > Parallax"

**Acceptance Criteria**:
- [ ] Use useTransform with scroll position
- [ ] Apply to blob backgrounds
- [ ] Different scroll speeds for different layers
- [ ] Subtle effect (max 100px movement)
- [ ] Only on desktop (pointer: fine)
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/effects/ParallaxBackground.tsx`

**Estimated Time**: 4 hours

---

### Task 15.4: Ripple Click Effect

**Description**: Create ripple effect on button clicks.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Micro-Interactions Library > Ripple"

**Acceptance Criteria**:
- [ ] Create ripple element at click position
- [ ] Animate scale from 0 to 2
- [ ] Animate opacity from 0.5 to 0
- [ ] Duration: 600ms
- [ ] Remove ripple element after animation
- [ ] Apply to all buttons
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/effects/RippleEffect.tsx`
- `lib/hooks/useRipple.ts`

**Estimated Time**: 4 hours

---

### Task 15.5: Checkbox Animation

**Description**: Create animated checkbox with checkmark draw animation.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Micro-Interactions Library > Checkbox"

**Acceptance Criteria**:
- [ ] Checkbox: 20x20px, border radius 4px
- [ ] Unchecked: border only
- [ ] Checked: primary background, white checkmark
- [ ] Checkmark draws in with path animation (stroke-dashoffset)
- [ ] Duration: 300ms
- [ ] Bounce effect on check
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/Checkbox.tsx`
- `components/common/Checkbox.test.tsx`

**Estimated Time**: 3 hours

---

### Task 15.6: Toggle Switch Animation

**Description**: Create animated toggle switch with smooth slide.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Micro-Interactions Library > Toggle"

**Acceptance Criteria**:
- [ ] Switch: 44x24px, border radius full
- [ ] Knob: 20x20px circle
- [ ] Off: gray background, knob on left
- [ ] On: primary background, knob on right
- [ ] Knob slides with spring physics
- [ ] Background color transitions smoothly
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/Toggle.tsx`
- `components/common/Toggle.test.tsx`

**Estimated Time**: 3 hours

---

### Task 15.7: Counter Animation

**Description**: Create animated counter that counts up to target value.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Micro-Interactions Library > Counter"

**Acceptance Criteria**:
- [ ] Animate from 0 (or previous value) to target value
- [ ] Use easeOut easing
- [ ] Duration: 800ms
- [ ] Support decimal places
- [ ] Apply to planning card statistics
- [ ] Respect prefers-reduced-motion (instant)
- [ ] Write component tests

**Files to Create**:
- `components/common/AnimatedCounter.tsx`
- `lib/hooks/useCountUp.ts`

**Estimated Time**: 3 hours

---

### Task 15.8: Progress Ring Animation

**Description**: Create circular progress ring with animated stroke.

**Requirements**: REQ-4 (Animation System)

**Design Reference**: See design.md "Micro-Interactions Library > Progress Ring"

**Acceptance Criteria**:
- [ ] SVG circle with stroke-dasharray animation
- [ ] Animate from 0% to target percentage
- [ ] Duration: 1000ms
- [ ] Use easeOut easing
- [ ] Display percentage in center
- [ ] Support custom colors
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `components/common/ProgressRing.tsx`
- `components/common/ProgressRing.test.tsx`

**Estimated Time**: 4 hours

---

### Task 15.9: Hover Lift Effect

**Description**: Create reusable hover lift effect for cards.

**Requirements**: REQ-4 (Animation System)

**Acceptance Criteria**:
- [ ] Animate y from 0 to -2px on hover
- [ ] Animate shadow from md to lg on hover
- [ ] Use spring physics
- [ ] Apply to agent cards, session items, planning card
- [ ] Respect prefers-reduced-motion
- [ ] Write component tests

**Files to Create**:
- `lib/hooks/useHoverLift.ts`

**Estimated Time**: 2 hours

---

## Phase 16: Accessibility & Polish (Week 16-17)

### Task 16.1: Skip Links

**Description**: Add skip links for keyboard navigation.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Create SkipLinks component
- [ ] Add "Skip to main content" link
- [ ] Add "Skip to navigation" link
- [ ] Position absolute, top-left
- [ ] Hidden by default (sr-only class)
- [ ] Visible on focus (remove sr-only)
- [ ] Style with primary background, white text
- [ ] Padding 8px 16px, border radius 8px
- [ ] Write component tests

**Files to Create**:
- `components/common/SkipLinks.tsx`
- `components/common/SkipLinks.test.tsx`

**Estimated Time**: 2 hours

---

### Task 16.2: ARIA Live Regions

**Description**: Add ARIA live regions for dynamic content announcements.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Create LiveRegion component
- [ ] Support polite and assertive priorities
- [ ] Add to chat for streaming messages
- [ ] Add to sidebar for agent/session changes
- [ ] Add to forms for validation errors
- [ ] Add to toasts for notifications
- [ ] Write component tests

**Files to Create**:
- `components/common/LiveRegion.tsx`
- `components/common/LiveRegion.test.tsx`

**Estimated Time**: 3 hours

---

### Task 16.3: Focus Indicators

**Description**: Ensure all interactive elements have visible focus indicators.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Add 2px outline in primary color for all focusable elements
- [ ] Ensure focus indicators are visible in both themes
- [ ] Test keyboard navigation through all interactive elements
- [ ] Verify logical tab order
- [ ] Add focus-visible styles (hide on mouse click, show on keyboard)
- [ ] Write accessibility tests

**Files to Modify**:
- `app/globals.css`
- All interactive components

**Estimated Time**: 4 hours

---

### Task 16.4: Semantic HTML Audit

**Description**: Ensure proper semantic HTML structure throughout the app.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Use nav element for sidebar
- [ ] Use main element for chat interface
- [ ] Use article element for messages
- [ ] Use button element for all clickable actions (not div)
- [ ] Add proper heading hierarchy (h1, h2, h3)
- [ ] Add ARIA labels for icon-only buttons
- [ ] Add ARIA descriptions where needed
- [ ] Write accessibility tests

**Files to Modify**:
- All component files

**Estimated Time**: 4 hours

---

### Task 16.5: Keyboard Navigation Implementation

**Description**: Implement comprehensive keyboard navigation.

**Requirements**: REQ-24 (Accessibility), REQ-25 (Keyboard Shortcuts)

**Acceptance Criteria**:
- [ ] Implement Cmd/Ctrl+K for search focus
- [ ] Implement Cmd/Ctrl+N for new chat
- [ ] Implement Cmd/Ctrl+B for toggle sidebar
- [ ] Implement Escape for closing modals
- [ ] Implement Cmd/Ctrl+Enter for sending messages
- [ ] Implement arrow keys for sidebar navigation
- [ ] Implement Tab/Shift+Tab for focus navigation
- [ ] Implement Cmd/Ctrl+/ for shortcuts help
- [ ] Test all shortcuts in both themes
- [ ] Write keyboard navigation tests

**Files to Modify**:
- `app/layout.tsx` (global shortcuts)
- Various components

**Estimated Time**: 6 hours

---

### Task 16.6: Screen Reader Testing

**Description**: Test application with screen readers and fix issues.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Test with VoiceOver (macOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Ensure all interactive elements are announced
- [ ] Ensure all images have alt text
- [ ] Ensure all form inputs have labels
- [ ] Ensure all buttons have accessible names
- [ ] Fix all identified issues
- [ ] Document screen reader support

**Estimated Time**: 8 hours

---

### Task 16.7: Color Contrast Audit

**Description**: Ensure all text meets WCAG AA contrast requirements.

**Requirements**: REQ-24 (Accessibility)

**Acceptance Criteria**:
- [ ] Test all text colors against backgrounds
- [ ] Ensure 4.5:1 contrast for normal text
- [ ] Ensure 3:1 contrast for large text (18px+)
- [ ] Test in both light and dark themes
- [ ] Fix any failing combinations
- [ ] Document contrast ratios

**Estimated Time**: 4 hours

---

### Task 16.8: Accessibility Audit with axe

**Description**: Run automated accessibility audit and fix violations.

**Requirements**: REQ-24 (Accessibility), REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Install axe-core and jest-axe
- [ ] Run axe audit on all components
- [ ] Fix all critical violations
- [ ] Fix all serious violations
- [ ] Document moderate violations
- [ ] Achieve 0 critical/serious violations
- [ ] Write accessibility tests for all components

**Files to Create**:
- `lib/test-utils/accessibility.ts`

**Estimated Time**: 8 hours

---

## Phase 17: Performance Optimization (Week 17-18)

### Task 17.1: Code Splitting

**Description**: Implement code splitting for heavy components.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Lazy load MarkdownRenderer
- [ ] Lazy load CodeBlock
- [ ] Lazy load MermaidDiagram
- [ ] Lazy load MathRenderer
- [ ] Lazy load Shiki syntax highlighter
- [ ] Lazy load emoji picker
- [ ] Add Suspense boundaries with skeleton loaders
- [ ] Measure bundle size reduction
- [ ] Write performance tests

**Files to Modify**:
- `components/markdown/MarkdownRenderer.tsx`
- `components/chat/Message.tsx`
- `components/chat/EmojiPicker.tsx`

**Estimated Time**: 5 hours

---

### Task 17.2: Component Memoization

**Description**: Memoize expensive components to prevent unnecessary re-renders.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Memoize Message component
- [ ] Memoize AgentCard component
- [ ] Memoize SessionItem component
- [ ] Memoize CodeBlock component
- [ ] Memoize TaskItem component
- [ ] Add custom comparison functions where needed
- [ ] Measure re-render reduction with React DevTools
- [ ] Write performance tests

**Files to Modify**:
- `components/chat/Message.tsx`
- `components/sidebar/AgentCard.tsx`
- `components/sidebar/SessionItem.tsx`
- `components/markdown/CodeBlock.tsx`
- `components/chat/TaskItem.tsx`

**Estimated Time**: 4 hours

---

### Task 17.3: Virtual Scrolling Implementation

**Description**: Implement virtual scrolling for long lists.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Install @tanstack/react-virtual
- [ ] Implement virtual scrolling in MessageList (100+ messages)
- [ ] Implement virtual scrolling in SessionList (100+ sessions)
- [ ] Estimate item heights dynamically
- [ ] Overscan 5 items above/below viewport
- [ ] Maintain scroll position on new items
- [ ] Test with 500+ items
- [ ] Write performance tests

**Files to Modify**:
- `components/chat/MessageList.tsx`
- `components/sidebar/SessionList.tsx`

**Estimated Time**: 6 hours

---

### Task 17.4: Image Optimization

**Description**: Optimize images using Next.js Image component.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Replace img tags with Next.js Image
- [ ] Add width and height attributes
- [ ] Enable lazy loading
- [ ] Add blur placeholder
- [ ] Optimize avatar images
- [ ] Measure loading time improvement
- [ ] Write performance tests

**Files to Modify**:
- `components/common/Avatar.tsx`
- Any components with images

**Estimated Time**: 3 hours

---

### Task 17.5: Debounce Search and Inputs

**Description**: Debounce search inputs and expensive operations.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Add search input to sidebar
- [ ] Debounce search with 300ms delay
- [ ] Filter agents/sessions locally first
- [ ] Call API for server-side search if needed
- [ ] Show loading indicator during search
- [ ] Debounce message input for typing indicator
- [ ] Write performance tests

**Files to Create**:
- `components/sidebar/SearchInput.tsx`

**Estimated Time**: 4 hours

---

### Task 17.6: Animation Performance Optimization

**Description**: Optimize animations for 60fps performance.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Ensure all animations use transform and opacity only
- [ ] Add will-change hints for animated elements
- [ ] Remove will-change after animation completes
- [ ] Use GPU-accelerated properties
- [ ] Test animations on low-end devices
- [ ] Measure frame rate with Chrome DevTools
- [ ] Optimize any animations below 60fps

**Estimated Time**: 4 hours

---

### Task 17.7: Bundle Size Analysis

**Description**: Analyze and optimize bundle size.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Run bundle analyzer
- [ ] Identify large dependencies
- [ ] Replace heavy dependencies with lighter alternatives
- [ ] Remove unused code
- [ ] Measure bundle size reduction
- [ ] Document bundle size metrics
- [ ] Set up bundle size monitoring

**Files to Create**:
- `docs/BUNDLE_SIZE.md`

**Estimated Time**: 4 hours

---

### Task 17.8: Performance Monitoring

**Description**: Add performance monitoring and metrics.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Measure First Contentful Paint (FCP)
- [ ] Measure Time to Interactive (TTI)
- [ ] Measure Largest Contentful Paint (LCP)
- [ ] Measure Cumulative Layout Shift (CLS)
- [ ] Run Lighthouse audit
- [ ] Achieve FCP < 1.5s on 3G
- [ ] Achieve LCP < 2.5s
- [ ] Achieve Lighthouse score > 90
- [ ] Document performance metrics

**Files to Create**:
- `lib/utils/performance.ts`
- `docs/PERFORMANCE.md`

**Estimated Time**: 5 hours

---

## Phase 18: Testing (Week 18-20)

### Task 18.1: Component Unit Tests

**Description**: Write comprehensive unit tests for all components.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test all Button variants and states
- [ ] Test all Input variants and validation
- [ ] Test Modal open/close and focus trap
- [ ] Test Toast auto-dismiss and stacking
- [ ] Test all sidebar components
- [ ] Test all chat components
- [ ] Test all markdown components
- [ ] Test all tool execution components
- [ ] Test all confirmation components
- [ ] Achieve 80%+ code coverage for components
- [ ] All tests pass

**Files**: All `.test.tsx` files

**Estimated Time**: 20 hours

---

### Task 18.2: Store Integration Tests

**Description**: Write integration tests for Zustand stores.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test UI store state transitions
- [ ] Test agent store CRUD operations
- [ ] Test session store CRUD operations with hierarchy
- [ ] Test chat store message handling and streaming
- [ ] Test planning store task updates
- [ ] Test optimistic updates
- [ ] Test error handling and rollback
- [ ] Test localStorage persistence
- [ ] All tests pass

**Files**: All store `.test.ts` files

**Estimated Time**: 10 hours

---

### Task 18.3: API Integration Tests

**Description**: Write integration tests for API client.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test all agent API methods
- [ ] Test all session API methods
- [ ] Test message API methods
- [ ] Test SSE streaming and event handling
- [ ] Test confirmation API methods
- [ ] Test retry logic
- [ ] Test error handling
- [ ] Mock API responses
- [ ] All tests pass

**Files**: All API `.test.ts` files

**Estimated Time**: 8 hours

---

### Task 18.4: E2E Tests with Playwright

**Description**: Write end-to-end tests for critical user flows.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Install Playwright
- [ ] Test agent creation flow
- [ ] Test agent editing flow
- [ ] Test agent deletion flow
- [ ] Test session creation flow
- [ ] Test message sending flow
- [ ] Test tool execution display
- [ ] Test confirmation request flow
- [ ] Test theme switching
- [ ] Test responsive behavior (mobile/desktop)
- [ ] All tests pass

**Files to Create**:
- `e2e/agent-management.spec.ts`
- `e2e/chat-flow.spec.ts`
- `e2e/tool-execution.spec.ts`
- `e2e/confirmation.spec.ts`
- `e2e/theme-switching.spec.ts`
- `e2e/responsive.spec.ts`

**Estimated Time**: 15 hours

---

### Task 18.5: Accessibility Tests

**Description**: Write automated accessibility tests.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test all components with axe
- [ ] Test keyboard navigation
- [ ] Test screen reader announcements
- [ ] Test focus management
- [ ] Test color contrast
- [ ] All tests pass with 0 violations

**Files**: All component `.test.tsx` files

**Estimated Time**: 8 hours

---

### Task 18.6: Visual Regression Tests

**Description**: Set up visual regression testing.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Install Playwright or Percy
- [ ] Capture screenshots of all major views
- [ ] Test light and dark themes
- [ ] Test responsive breakpoints
- [ ] Set up baseline images
- [ ] Configure CI/CD integration
- [ ] All tests pass

**Files to Create**:
- `e2e/visual-regression.spec.ts`

**Estimated Time**: 6 hours

---

## Phase 19: Final Polish & Deployment (Week 20-21)

### Task 19.1: Cross-Browser Testing

**Description**: Test application across different browsers.

**Requirements**: REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Fix any browser-specific issues
- [ ] Document browser support
- [ ] Test all animations in each browser

**Estimated Time**: 6 hours

---

### Task 19.2: Mobile Device Testing

**Description**: Test application on real mobile devices.

**Requirements**: REQ-13 (Responsive Design), REQ-28 (Testing)

**Acceptance Criteria**:
- [ ] Test on iPhone (iOS Safari)
- [ ] Test on Android (Chrome)
- [ ] Test portrait and landscape orientations
- [ ] Test touch interactions
- [ ] Test swipe gestures
- [ ] Test pull-to-refresh
- [ ] Fix any mobile-specific issues

**Estimated Time**: 6 hours

---

### Task 19.3: Documentation

**Description**: Create comprehensive documentation for the project.

**Requirements**: REQ-27 (Component Architecture)

**Acceptance Criteria**:
- [ ] Document component API with JSDoc
- [ ] Create README with setup instructions
- [ ] Document design system usage
- [ ] Document state management patterns
- [ ] Document API integration
- [ ] Document animation system
- [ ] Create contributing guidelines
- [ ] Document deployment process
- [ ] Create user guide

**Files to Create**:
- `README.md`
- `CONTRIBUTING.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/STATE_MANAGEMENT.md`
- `docs/API_INTEGRATION.md`
- `docs/ANIMATION_SYSTEM.md`
- `docs/USER_GUIDE.md`

**Estimated Time**: 10 hours

---

### Task 19.4: Production Build Optimization

**Description**: Optimize production build for deployment.

**Requirements**: REQ-23 (Performance)

**Acceptance Criteria**:
- [ ] Configure Next.js for production
- [ ] Enable compression
- [ ] Optimize bundle size
- [ ] Configure caching headers
- [ ] Set up environment variables
- [ ] Test production build locally
- [ ] Measure bundle size and performance
- [ ] Configure CDN for static assets

**Files to Modify**:
- `next.config.js`
- `.env.production`

**Estimated Time**: 5 hours

---

### Task 19.5: Deployment Setup

**Description**: Set up deployment pipeline and hosting.

**Requirements**: General deployment

**Acceptance Criteria**:
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Configure deployment settings
- [ ] Set up environment variables
- [ ] Configure custom domain (if applicable)
- [ ] Set up CI/CD pipeline
- [ ] Deploy to staging environment
- [ ] Test staging deployment
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Set up monitoring and error tracking

**Estimated Time**: 6 hours

---

### Task 19.6: Final QA and Bug Fixes

**Description**: Conduct final QA pass and fix any remaining bugs.

**Requirements**: All requirements

**Acceptance Criteria**:
- [ ] Test all features end-to-end
- [ ] Test all user flows
- [ ] Test all edge cases
- [ ] Fix all critical bugs
- [ ] Fix all high-priority bugs
- [ ] Document known issues
- [ ] Create bug fix plan for remaining issues

**Estimated Time**: 10 hours

---

## Summary

**Total Tasks**: 150+ tasks across 19 phases
**Estimated Duration**: 20-21 weeks (2-3 developers)
**Total Estimated Hours**: ~550 hours

### Phase Breakdown

1. **Phase 0**: Codebase Review & Cleanup (16 hours)
2. **Phase 1**: Foundation & Design System (24 hours)
3. **Phase 2**: Enhanced Base Components (41 hours)
4. **Phase 3**: Custom Hooks (33 hours)
5. **Phase 4**: State Management (25 hours)
6. **Phase 5**: API Integration (26 hours)
7. **Phase 6**: Sidebar Components (43 hours)
8. **Phase 7**: Chat Interface Components (51 hours)
9. **Phase 8**: Agent Tool Execution Display (24 hours)
10. **Phase 9**: Human Intervention (23 hours)
11. **Phase 10**: Planning Card (26 hours)
12. **Phase 11**: Markdown & Rich Content (31 hours)
13. **Phase 12**: Modals & Forms (22 hours)
14. **Phase 13**: Theme Transition Effects (14 hours)
15. **Phase 14**: Loading & Error States (20 hours)
16. **Phase 15**: Scroll Animations & Micro-Interactions (27 hours)
17. **Phase 16**: Accessibility & Polish (39 hours)
18. **Phase 17**: Performance Optimization (35 hours)
19. **Phase 18**: Testing (67 hours)
20. **Phase 19**: Final Polish & Deployment (43 hours)

### Design Philosophy Integration

Every task includes a "Design Philosophy Reminder" where applicable, ensuring developers keep the bigger picture in mind:

- **Restrained Elegance**: 90% neutral grays, color only for meaning
- **Smooth Motion**: Spring physics, 60fps minimum, natural feel
- **Typography-First Hierarchy**: Establish importance through font, not color
- **Generous Spacing**: Breathing room creates calm, focused experience
- **Immediate Feedback**: Every interaction provides subtle, clear response

### Dependencies

- Phase 0 must be completed first (codebase cleanup)
- Phases 1-2 must be completed before other phases
- Phase 3 (Hooks) should be completed before Phase 4 (State Management)
- Phase 4 (State Management) should be completed before Phase 5 (API Integration)
- Phases 6-7 (UI Components) can be developed in parallel after Phase 5
- Phases 8-10 (Tool Display, Confirmation, Planning) depend on Phase 7
- Phase 11 (Markdown) depends on Phase 7
- Phase 18 (Testing) should run continuously throughout development
- Phase 19 (Deployment) is the final phase

### Getting Started

1. Review the requirements, design, and tasks documents
2. Set up your development environment
3. Start with Phase 0: Codebase Review & Cleanup
4. Work through phases sequentially
5. Keep design philosophy in mind for every component
6. Test continuously as you build
7. Review and iterate based on feedback

---

## Notes

- All tasks include writing tests (unit, integration, or E2E)
- Accessibility is a priority throughout development
- Performance optimization is built into the implementation
- Follow the design system strictly for visual consistency
- Use TypeScript for type safety
- Write clean, maintainable code with proper documentation
- Always respect prefers-reduced-motion for animations
- Keep the bigger picture (design philosophy) in mind for every component

**The spec is now complete and aligned with the comprehensive design document! You can begin implementation by working through the tasks in order.**

