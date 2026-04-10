# Multiple Choice Custom Input Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `MultipleChoiceInput` so the custom "Other" text option is a permanent, always-expanded list item (pending state), and the answered state shows the submitted text inside the "Other" row with a blue-wipe highlight — consistent with how predefined options are displayed.

**Architecture:** Single component change in `MultipleChoiceInput.tsx`. Pending state: "Other" row at the bottom of the options card, textarea always visible, typing activates the row and clears any selected predefined option. Answered state: "Other" row stays in the list, fades or highlights depending on whether it was selected; submitted text rendered inside the row in a white card.

**Tech Stack:** React, Framer Motion, Tailwind CSS, Vitest + React Testing Library

---

## File Map

| Action | Path |
|--------|------|
| Modify | `components/chat/MultipleChoiceInput.tsx` |
| Create | `components/chat/__tests__/MultipleChoiceInput.test.tsx` |

---

### Task 1: Write failing tests for the pending state

**Files:**
- Create: `components/chat/__tests__/MultipleChoiceInput.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// components/chat/__tests__/MultipleChoiceInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultipleChoiceInput } from '../MultipleChoiceInput'

const options = [
  { id: '1', label: 'Blue', value: 'blue' },
  { id: '2', label: 'Green', value: 'green' },
  { id: '3', label: 'Purple', value: 'purple' },
]

describe('MultipleChoiceInput — pending state', () => {
  it('renders all predefined options', () => {
    render(<MultipleChoiceInput options={options} onSubmit={vi.fn()} />)
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Green')).toBeInTheDocument()
    expect(screen.getByText('Purple')).toBeInTheDocument()
  })

  it('renders an Other option with a textarea', () => {
    render(<MultipleChoiceInput options={options} onSubmit={vi.fn()} />)
    expect(screen.getByText('Other')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a custom answer...')).toBeInTheDocument()
  })

  it('submit button is disabled when nothing is selected', () => {
    render(<MultipleChoiceInput options={options} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('submit button enables when a predefined option is clicked', async () => {
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={vi.fn()} />)
    await user.click(screen.getByText('Blue'))
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })

  it('submit button enables when text is typed into the Other textarea', async () => {
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={vi.fn()} />)
    await user.type(screen.getByPlaceholderText('Type a custom answer...'), 'Custom response')
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled()
  })

  it('typing in Other clears any selected predefined option', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={onSubmit} />)
    await user.click(screen.getByText('Blue'))
    await user.type(screen.getByPlaceholderText('Type a custom answer...'), 'Custom response')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith('Custom response')
  })

  it('selecting a predefined option clears Other textarea', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={onSubmit} />)
    await user.type(screen.getByPlaceholderText('Type a custom answer...'), 'Custom response')
    await user.click(screen.getByText('Blue'))
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith('blue')
  })

  it('submits the predefined option value when a predefined option is selected', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={onSubmit} />)
    await user.click(screen.getByText('Green'))
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith('green')
  })

  it('submits trimmed custom text when Other is filled', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<MultipleChoiceInput options={options} onSubmit={onSubmit} />)
    await user.type(screen.getByPlaceholderText('Type a custom answer...'), '  amber  ')
    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(onSubmit).toHaveBeenCalledWith('amber')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/rhp/Projects/agent-console
npx vitest run components/chat/__tests__/MultipleChoiceInput.test.tsx
```

Expected: Several tests fail — `Other` text, `Type a custom answer...` placeholder, and related assertions will not be found yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add components/chat/__tests__/MultipleChoiceInput.test.tsx
git commit -m "test: add failing tests for MultipleChoiceInput Other row and selection logic"
```

---

### Task 2: Implement the pending state redesign

**Files:**
- Modify: `components/chat/MultipleChoiceInput.tsx`

- [ ] **Step 1: Replace the pending state return block**

In `MultipleChoiceInput.tsx`, replace the entire `// Pending state - interactive with magnetic effect` section (the final `return` block) with the following. Do not touch the `isAnswered` block yet.

```tsx
  // Pending state
  const isOtherActive = customAnswer.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="space-y-0 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.value
          return (
            <div key={option.id} className="relative">
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedOption(option.value)
                  setCustomAnswer('')
                }}
                disabled={disabled || isSubmitting}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="
                  relative w-full flex items-center gap-3 px-4 py-3
                  text-left transition-all duration-200
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  overflow-hidden
                "
              >
                <motion.div
                  className="absolute inset-0 bg-white/50"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: 0 }}
                />
                <div className="relative w-5 h-5 flex-shrink-0" style={{ zIndex: 1 }}>
                  <motion.div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-white ring-2 ring-gray-300'}
                    `}
                    animate={isSelected ? {
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.4)',
                        '0 0 0 8px rgba(59, 130, 246, 0)',
                      ],
                    } : {}}
                    transition={{ duration: 0.6, repeat: isSelected ? Infinity : 0 }}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={springPresets.bouncy}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <span
                  className={`relative text-sm font-medium transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
                  style={{ zIndex: 1 }}
                >
                  {option.label}
                </span>
              </motion.button>

              {/* Separator after every row including before Other */}
              <div className="px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            </div>
          )
        })}

        {/* Other row — always expanded */}
        <div className="relative overflow-hidden">
          {isOtherActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'right', zIndex: 0 }}
            />
          )}
          <div className="relative flex items-start gap-3 px-4 py-3" style={{ zIndex: 1 }}>
            <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
              <motion.div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${isOtherActive ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-white ring-2 ring-gray-300'}
                `}
              >
                <AnimatePresence>
                  {isOtherActive && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={springPresets.bouncy}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="flex-1">
              <span
                className={`text-sm font-medium transition-colors ${isOtherActive ? 'text-blue-700' : 'text-gray-900'}`}
              >
                Other
              </span>
              <textarea
                value={customAnswer}
                onChange={(e) => {
                  setCustomAnswer(e.target.value)
                  if (e.target.value.trim()) {
                    setSelectedOption(null)
                  }
                }}
                placeholder="Type a custom answer..."
                disabled={disabled || isSubmitting}
                rows={2}
                className="
                  mt-2 w-full px-3 py-2 rounded-lg
                  bg-white
                  border border-gray-200
                  text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none transition-all duration-200
                "
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled || isSubmitting}
        className="
          w-full px-4 py-2.5 rounded-lg
          bg-blue-500 hover:bg-blue-600
          text-white text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit</span>
        )}
      </button>
    </div>
  )
```

- [ ] **Step 2: Update `canSubmit` and `handleSubmit`**

The existing `canSubmit` and `handleSubmit` already handle both paths correctly (`customAnswer.trim() || selectedOption`). Verify both are still present and unchanged at the top of the component function — no edits needed if they are.

```ts
// Confirm these lines are present (top of function body, before any return):
const handleSubmit = async () => {
  const answer = customAnswer.trim() || selectedOption
  if (!answer) return
  setIsSubmitting(true)
  try {
    await onSubmit(answer)
  } finally {
    setIsSubmitting(false)
  }
}

const canSubmit = customAnswer.trim() || selectedOption
```

- [ ] **Step 3: Run the pending-state tests**

```bash
npx vitest run components/chat/__tests__/MultipleChoiceInput.test.tsx
```

Expected: All 8 tests in `pending state` pass.

- [ ] **Step 4: Commit**

```bash
git add components/chat/MultipleChoiceInput.tsx
git commit -m "feat: redesign MultipleChoiceInput pending state with always-visible Other row"
```

---

### Task 3: Write failing tests for the answered state

**Files:**
- Modify: `components/chat/__tests__/MultipleChoiceInput.test.tsx`

- [ ] **Step 1: Append answered-state tests to the test file**

Add this `describe` block at the bottom of the file (after the closing `}` of the pending-state describe):

```tsx
describe('MultipleChoiceInput — answered state', () => {
  const options = [
    { id: '1', label: 'Blue', value: 'blue' },
    { id: '2', label: 'Green', value: 'green' },
    { id: '3', label: 'Purple', value: 'purple' },
  ]

  it('shows all predefined option labels when answered', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="blue"
      />
    )
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Green')).toBeInTheDocument()
    expect(screen.getByText('Purple')).toBeInTheDocument()
  })

  it('shows the Other row when answered', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="blue"
      />
    )
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('does not show a textarea when answered', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="blue"
      />
    )
    expect(screen.queryByPlaceholderText('Type a custom answer...')).not.toBeInTheDocument()
  })

  it('does not show a Submit button when answered', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="blue"
      />
    )
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('displays the submitted custom text inside the Other row when a custom answer was given', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="orange/amber scheme"
      />
    )
    expect(screen.getByText('orange/amber scheme')).toBeInTheDocument()
  })

  it('does not display custom text when a predefined option was selected', () => {
    render(
      <MultipleChoiceInput
        options={options}
        onSubmit={vi.fn()}
        isAnswered
        selectedAnswer="blue"
      />
    )
    expect(screen.queryByText('blue')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run components/chat/__tests__/MultipleChoiceInput.test.tsx
```

Expected: The new answered-state tests fail — textarea is still present in answered state, no Other row in answered state, etc.

- [ ] **Step 3: Commit the failing tests**

```bash
git add components/chat/__tests__/MultipleChoiceInput.test.tsx
git commit -m "test: add failing tests for MultipleChoiceInput answered state Other row"
```

---

### Task 4: Implement the answered state redesign

**Files:**
- Modify: `components/chat/MultipleChoiceInput.tsx`

- [ ] **Step 1: Replace the entire answered-state block**

Find the `if (isAnswered)` block (currently returns a `<div>` with the options list and a blockquote for custom answers). Replace it entirely with:

```tsx
  if (isAnswered) {
    const isOptionSelected = options.some(opt => opt.value === selectedAnswer)
    const isCustomAnswerSelected = !isOptionSelected && !!selectedAnswer

    return (
      <div className="space-y-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {options.map((option, index) => {
          const isSelected = option.value === selectedAnswer
          return (
            <div key={option.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, ...springPresets.gentle }}
                className="relative overflow-hidden"
              >
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ zIndex: 0, transformOrigin: 'right' }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-4 py-3 transition-all duration-300 ${isSelected ? '' : 'opacity-35'}`}
                  style={{ zIndex: 1 }}
                >
                  <motion.div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}`}
                    animate={{ scale: isSelected ? [1, 1.3, 1] : 1, rotate: isSelected ? [0, 180, 360] : 0 }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      {isSelected && (
                        <motion.div
                          key="checkmark"
                          initial={{ scale: 0, rotate: -180, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: 180, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span
                    className={`relative text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}
                    style={{ zIndex: 1 }}
                  >
                    {option.label}
                  </span>
                </div>
              </motion.div>

              <div className="px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            </div>
          )
        })}

        {/* Other row — always rendered, highlighted if custom answer was submitted */}
        <div className="relative overflow-hidden">
          {isCustomAnswerSelected && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 0, transformOrigin: 'right' }}
            />
          )}
          <div
            className={`relative flex items-start gap-3 px-4 py-3 transition-all duration-300 ${!isCustomAnswerSelected ? 'opacity-35' : ''}`}
            style={{ zIndex: 1 }}
          >
            <motion.div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isCustomAnswerSelected
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  : 'bg-gray-200'
              }`}
              animate={{ scale: isCustomAnswerSelected ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <AnimatePresence mode="wait">
                {isCustomAnswerSelected && (
                  <motion.div
                    key="checkmark"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex-1">
              <span
                className={`text-sm font-medium ${isCustomAnswerSelected ? 'text-blue-700' : 'text-gray-500'}`}
              >
                Other
              </span>
              {isCustomAnswerSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-2 bg-white rounded-lg border border-blue-100 shadow-sm px-3 py-2"
                >
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedAnswer}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
```

- [ ] **Step 2: Remove the old `isCustomAnswerSelected` and `isOptionSelected` lines**

The old `isAnswered` block had these two lines before the `if (isAnswered)` return:

```ts
const isOptionSelected = isAnswered && options.some(opt => opt.value === selectedAnswer)
const isCustomAnswerSelected = isAnswered && !isOptionSelected && selectedAnswer
```

Delete them — both variables are now declared inside the `if (isAnswered)` block.

- [ ] **Step 3: Run all tests**

```bash
npx vitest run components/chat/__tests__/MultipleChoiceInput.test.tsx
```

Expected: All tests pass.

- [ ] **Step 4: Run the full test suite to check for regressions**

```bash
npx vitest run
```

Expected: No new failures.

- [ ] **Step 5: Commit**

```bash
git add components/chat/MultipleChoiceInput.tsx
git commit -m "feat: redesign MultipleChoiceInput answered state with integrated Other row"
```
