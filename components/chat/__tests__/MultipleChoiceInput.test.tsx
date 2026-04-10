import { describe, it, expect, vi } from 'vitest'
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

describe('MultipleChoiceInput — answered state', () => {
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
