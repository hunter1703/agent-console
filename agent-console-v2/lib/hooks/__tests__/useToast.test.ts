import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast', () => {
  describe('Initialization', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast())
      expect(result.current.toasts).toEqual([])
    })

    it('should provide showToast function', () => {
      const { result } = renderHook(() => useToast())
      expect(typeof result.current.showToast).toBe('function')
    })

    it('should provide dismissToast function', () => {
      const { result } = renderHook(() => useToast())
      expect(typeof result.current.dismissToast).toBe('function')
    })

    it('should provide dismissAll function', () => {
      const { result } = renderHook(() => useToast())
      expect(typeof result.current.dismissAll).toBe('function')
    })

    it('should provide convenience methods', () => {
      const { result } = renderHook(() => useToast())
      expect(typeof result.current.success).toBe('function')
      expect(typeof result.current.error).toBe('function')
      expect(typeof result.current.warning).toBe('function')
      expect(typeof result.current.info).toBe('function')
    })
  })

  describe('showToast', () => {
    it('should add a toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'Test message')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].variant).toBe('success')
      expect(result.current.toasts[0].message).toBe('Test message')
    })

    it('should return toast id', () => {
      const { result } = renderHook(() => useToast())

      let toastId: string = ''
      act(() => {
        toastId = result.current.showToast('info', 'Test')
      })

      expect(toastId).toMatch(/^toast-\d+$/)
    })

    it('should accept custom duration', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'Test', 5000)
      })

      expect(result.current.toasts[0].duration).toBe(5000)
    })

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'First')
        result.current.showToast('error', 'Second')
        result.current.showToast('warning', 'Third')
      })

      expect(result.current.toasts).toHaveLength(3)
    })

    it('should generate unique ids', () => {
      const { result } = renderHook(() => useToast())

      let id1: string = ''
      let id2: string = ''

      act(() => {
        id1 = result.current.showToast('success', 'First')
        id2 = result.current.showToast('success', 'Second')
      })

      expect(id1).not.toBe(id2)
    })
  })

  describe('dismissToast', () => {
    it('should remove specific toast', () => {
      const { result } = renderHook(() => useToast())

      let toastId: string = ''
      act(() => {
        toastId = result.current.showToast('success', 'Test')
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        result.current.dismissToast(toastId)
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should only remove specified toast', () => {
      const { result } = renderHook(() => useToast())

      let id1: string = ''
      let id2: string = ''

      act(() => {
        id1 = result.current.showToast('success', 'First')
        id2 = result.current.showToast('error', 'Second')
      })

      expect(result.current.toasts).toHaveLength(2)

      act(() => {
        result.current.dismissToast(id1)
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].id).toBe(id2)
    })

    it('should handle non-existent id gracefully', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'Test')
      })

      act(() => {
        result.current.dismissToast('non-existent-id')
      })

      expect(result.current.toasts).toHaveLength(1)
    })
  })

  describe('dismissAll', () => {
    it('should remove all toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'First')
        result.current.showToast('error', 'Second')
        result.current.showToast('warning', 'Third')
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should handle empty toasts array', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('Convenience Methods', () => {
    it('should show success toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Success message')
      })

      expect(result.current.toasts[0].variant).toBe('success')
      expect(result.current.toasts[0].message).toBe('Success message')
    })

    it('should show error toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.error('Error message')
      })

      expect(result.current.toasts[0].variant).toBe('error')
      expect(result.current.toasts[0].message).toBe('Error message')
    })

    it('should show warning toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.warning('Warning message')
      })

      expect(result.current.toasts[0].variant).toBe('warning')
      expect(result.current.toasts[0].message).toBe('Warning message')
    })

    it('should show info toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.info('Info message')
      })

      expect(result.current.toasts[0].variant).toBe('info')
      expect(result.current.toasts[0].message).toBe('Info message')
    })

    it('should accept custom duration in convenience methods', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Test', 10000)
      })

      expect(result.current.toasts[0].duration).toBe(10000)
    })
  })

  describe('Toast Properties', () => {
    it('should include onClose callback', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'Test')
      })

      expect(typeof result.current.toasts[0].onClose).toBe('function')
    })

    it('should call onClose to dismiss toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', 'Test')
      })

      const toast = result.current.toasts[0]

      act(() => {
        toast.onClose()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast('success', '')
      })

      expect(result.current.toasts[0].message).toBe('')
    })

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useToast())
      const longMessage = 'A'.repeat(1000)

      act(() => {
        result.current.showToast('success', longMessage)
      })

      expect(result.current.toasts[0].message).toBe(longMessage)
    })

    it('should handle rapid successive calls', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.showToast('success', `Message ${i}`)
        }
      })

      expect(result.current.toasts).toHaveLength(10)
    })
  })
})
