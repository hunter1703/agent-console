'use client'

/**
 * Model Creation Page
 * 
 * Wizard for creating new models using schema-driven forms.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageTransition } from '@/components/common/PageTransition'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { createModel } from '@/lib/api/models'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function NewModelPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)

  // Set page title
  useEffect(() => {
    document.title = 'New Model'
    setPageTitle('New Model')
  }, [setPageTitle])

  // Create model mutation
  const createModelMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return createModel(data)
    },
    onSuccess: () => {
      success('Model created successfully')
      queryClient.invalidateQueries({ queryKey: ['models'] })
      router.push('/models')
    },
    onError: (err: any) => {
      showError('Failed to create model', err.message)
    },
  })

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    await createModelMutation.mutateAsync(data)
  }

  // Handle cancel
  const handleCancel = () => {
    router.push('/models')
  }

  return (
    <PageTransition pageKey="new-model" className="h-full">
      <div className="h-full flex flex-col bg-background">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-6">
          {/* Header */}
          <div className="flex-shrink-0 pt-12 pb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/models')}
                className="p-2"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Create New Model
                </h1>
                <p className="text-text-tertiary mt-1">
                  Configure a new AI model
                </p>
              </div>
            </div>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 min-h-0 pb-8">
            <div className="h-full overflow-y-auto">
              <Card className="p-8">
                <DynamicForm
                  assetType="Model"
                  mode="CREATE"
                  initialData={{}}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
