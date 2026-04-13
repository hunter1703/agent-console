'use client'

/**
 * UI Provider
 * 
 * Provides global UI components that integrate with the UI store:
 * - Toast notifications
 * - Modal dialogs
 * - Loading overlays
 * - Dynamic page titles
 * 
 * This component should be placed high in the component tree to ensure
 * toasts and modals are rendered above all other content.
 */

import { useEffect } from 'react'
import { ToastContainer } from '@/components/common/Toast'
import { Modal } from '@/components/common/Modal'
import { useUIStore, useToasts, useDialogs } from '@/lib/store/ui'
import { Button } from '@/components/common/Button'

export function UIProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToasts()
  const { dialogs, hideDialog } = useDialogs()
  const pageTitle = useUIStore(state => state.pageTitle)
  
  // Set up reduced motion detection
  const setReducedMotion = useUIStore(state => state.setReducedMotion)
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setReducedMotion])

  // Update document title when pageTitle changes - immediate and reliable
  useEffect(() => {
    const updateTitle = (title: string) => {
      if (typeof document !== 'undefined') {
        document.title = title ? `${title} - Agent Console` : 'Agent Console'
      }
    }
    
    // Immediate update
    updateTitle(pageTitle)
    
    // Additional immediate fallback
    setTimeout(() => updateTitle(pageTitle), 0)
  }, [pageTitle])

  return (
    <>
      {children}
      
      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts.map(toast => ({
          ...toast,
          variant: toast.type,
          message: toast.title + (toast.message ? `: ${toast.message}` : ''),
          onClose: () => removeToast(toast.id),
        }))}
        position="top-right"
        maxToasts={5}
      />
      
      {/* Modal Dialogs */}
      {dialogs.map(dialog => (
        <Modal
          key={dialog.id}
          isOpen={true}
          onClose={() => {
            dialog.onCancel?.()
            hideDialog(dialog.id)
          }}
          title={dialog.title}
          footer={
            dialog.type === 'confirm' ? (
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    dialog.onCancel?.()
                    hideDialog(dialog.id)
                  }}
                >
                  {dialog.cancelText}
                </Button>
                <Button
                  variant={dialog.variant === 'danger' ? 'destructive' : 'default'}
                  onClick={async () => {
                    try {
                      await dialog.onConfirm?.()
                      hideDialog(dialog.id)
                    } catch (error) {
                      console.error('Dialog confirm error:', error)
                      // Keep dialog open on error
                    }
                  }}
                >
                  {dialog.confirmText}
                </Button>
              </div>
            ) : dialog.type === 'alert' ? (
              <Button
                onClick={() => hideDialog(dialog.id)}
              >
                OK
              </Button>
            ) : null
          }
        >
          {dialog.message && (
            <p className="text-text-secondary">
              {dialog.message}
            </p>
          )}
          
          {dialog.component && (
            <dialog.component {...dialog.props} />
          )}
        </Modal>
      ))}
    </>
  )
}