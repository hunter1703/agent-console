'use client'

/**
 * Model View/Edit Page
 * 
 * Dynamic page for viewing and editing individual models.
 * Uses schema-driven forms with mode-based rendering (VIEW/EDIT).
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageTransition } from '@/components/common/PageTransition'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { getModel, updateModel, type Model } from '@/lib/api/models'
import { apiClient } from '@/lib/api/client'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function ModelPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  const modelId = params.id as string

  // Fetch model data using catalog API
  const {
    data: model,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['models', modelId],
    queryFn: async () => {
      // Use the catalog API to fetch the model with proper endpoint
      const response = await apiClient.get<Model>(`/v1/catalog/Model/${modelId}`)
      return response
    },
    enabled: !!modelId && modelId !== 'new',
  })

  // Update model mutation
  const updateModelMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return updateModel(modelId, data)
    },
    onSuccess: () => {
      success('Model updated successfully')
      queryClient.invalidateQueries({ queryKey: ['models'] })
      queryClient.invalidateQueries({ queryKey: ['models', modelId] })
      router.push('/models')
    },
    onError: (err: any) => {
      showError('Failed to update model', err.message)
    },
  })

  // Set page title
  useEffect(() => {
    const title = model ? `${model.name} - Model` : 'Model'
    document.title = title
    setPageTitle(title)
  }, [model, setPageTitle])

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    await updateModelMutation.mutateAsync(data)
  }

  // Handle cancel
  const handleCancel = () => {
    router.push('/models')
  }

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-text-secondary">Loading model...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Error state
  if (loadError) {
    return (
      <PageTransition>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
            <div className="mb-12" />
            
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-error mb-4">
                Failed to Load Model
              </h2>
              <p className="text-text-secondary mb-6">
                {(loadError as any)?.message || 'An error occurred while loading the model'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => router.push('/models')}>
                  Back to Models
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  // No model found
  if (!model) {
    return (
      <PageTransition>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
            <div className="mb-12" />
            
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Model Not Found
              </h2>
              <p className="text-text-secondary mb-6">
                The model you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/models')}>
                Back to Models
              </Button>
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
          {/* Spacer for consistent layout */}
          <div className="mb-12" />
          
          {/* Header */}
          <div className="flex-shrink-0 mb-8">
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
                  {model.name}
                </h1>
                <p className="text-text-tertiary mt-1">
                  Edit model configuration
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 min-h-0 overflow-y-auto pb-8">
            <Card className="p-8">
              <DynamicForm
                assetType="Model"
                mode="EDIT"
                initialData={model}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
