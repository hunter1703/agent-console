# Multiple Choice Custom Input Redesign

**Date:** 2026-04-10  
**Scope:** `components/chat/MultipleChoiceInput.tsx`

## Problem

The current custom text ("Other") input in `MultipleChoiceInput` is visually disconnected from the options list — a plain floating textarea below the options with a generic Submit button. The answered state displays submitted custom text as a blockquote with a left blue border, which feels basic and inconsistent with the rest of the confirmation UI.

## Files Changed

- `components/chat/MultipleChoiceInput.tsx` — only file modified

## Pending State Design

### "Other" row

A permanent list item at the bottom of the options card, always fully expanded. It uses the same row structure as the predefined options:

- **Left:** radio circle (same size and style as other rows)
- **Right of circle:** "Other" label text, then below it the textarea (always visible, no click-to-reveal)
- **Background/border:** no special background until active; when "Other" is the active selection (textarea has text), apply the same blue tint (`bg-blue-50`) and blue ring on the circle that predefined options get when selected
- **Separator:** same gradient divider (`from-transparent via-gray-300 to-transparent`) between Purple and Other as between all other rows

### Selection logic

- Typing anything into the textarea automatically selects "Other" (sets `selectedOption` to a sentinel value like `'__other__'`) and clears any previously selected predefined option
- Clicking a predefined option clears the textarea content and deselects "Other"
- These two states are mutually exclusive

### Submit button

Single full-width Submit button below the list, unchanged in appearance. Enabled when either:
- A predefined option is selected (`selectedOption !== null && selectedOption !== '__other__'`), or
- The textarea has non-empty trimmed content

Submission sends `customAnswer.trim()` when "Other" is active, or `selectedOption` otherwise (same as today).

## Answered State Design

The full options list remains rendered. Layout changes:

- **Predefined option rows:** fade to `opacity-35` if not selected. If a predefined option was selected, it gets the same blue wipe + checkmark treatment as today (no change to that path).
- **"Other" row when selected:** 
  - Radio circle becomes a gradient blue checkmark (matching predefined selected style: `bg-gradient-to-br from-blue-500 to-indigo-500`, white check icon)
  - Row background gets a blue tint wipe (`bg-gradient-to-r from-blue-50 to-indigo-50`), same animation as predefined rows
  - Submitted text appears inside the row below the "Other" label in a small white card: `bg-white`, `rounded-lg`, `border border-blue-100`, `shadow-sm`, `px-3 py-2`, `text-sm text-gray-700`
- **"Other" row when not selected:** fades to `opacity-35` like the predefined rows (no text card shown)

## State Shape

No new props needed. Existing `isAnswered` and `selectedAnswer` props already cover both paths. The component infers "Other was selected" when `isAnswered === true` and `selectedAnswer` does not match any `option.value`.

## Out of Scope

- `TextConfirmationInput` (standalone text-only confirmation) — not changed
- `BinaryDecisionInput` — not changed
- Glass variants (`MultipleChoiceInputGlass`) — not changed in this pass
