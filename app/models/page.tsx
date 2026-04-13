'use client'

/**
 * Models Management Page
 * 
 * List view for managing AI models with search, filtering, and CRUD operations.
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Database } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { SearchInput } from '@/components/sidebar/SearchInput'
import { ScrollReveal, ScrollStagger } from '@/components/common/ScrollReveal'
import { PageTransition } from '@/components/common/PageTransition'

import { listModels, deleteModel, type Model } from '@/lib/api/models'
import { useUIStore, useToasts, useDialogs } from '@/lib/store/ui'
import { springPresets } from '@/lib/constants/animations'
import { formatRelativeTime } from '@/lib/utils/formatDate'

export default function ModelsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error } = useToasts()
  const { danger } = useDialogs()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Set page title
  useEffect(() => {
    document.title = 'Models'
    setPageTitle('Models')
  }, [setPageTitle])

  // Load models
  const {
    data: modelsData,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['models', 'list', { search: searchQuery }],
    queryFn: () => listModels(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      success('Model deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
    onError: (err: any) => {
      error('Failed to delete model', err.message)
    },
  })

  const models = modelsData?.items || []
  
  // Filter models by search query - memoized to prevent unnecessary re-renders
  const filteredModels = useMemo(() => {
    return models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.model?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [models, searchQuery])

  // Navigation handlers
  const handleCreateModel = () => {
    router.push('/models/new')
  }

  const handleViewModel = (modelId: string) => {
    router.push(`/models/${modelId}`)
  }

  const handleEditModel = (modelId: string) => {
    router.push(`/models/${modelId}`)
  }

  const handleDeleteModel = (model: Model) => {
    danger(
      'Delete Model',
      `Are you sure you want to delete "${model.name}"? This action cannot be undone.`,
      () => deleteModelMutation.mutate(model.id)
    )
  }

  return (
    <PageTransition pageKey="models" className="h-full">
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-6">
          {/* Header */}
          <div className="flex-shrink-0 pt-12 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-text-primary">Models</h1>
                <p className="text-text-tertiary mt-2">
                  Manage your AI models and configurations
                </p>
              </div>
              
              <Button
                icon={<Plus size={20} />}
                onClick={handleCreateModel}
                className="w-full sm:w-auto"
              >
                Add New Model
              </Button>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search models..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
              />
            </div>
            
            <div className="text-sm text-text-tertiary">
              {filteredModels.length} of {models.length} models
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>

          {/* Models List - Scrollable Container */}
          <div className="flex-1 min-h-0 flex flex-col pb-8">
            {isLoading ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 px-4 py-3 bg-surface-elevated rounded-t-xl border border-border-subtle border-b-0">
                    <span className="text-sm font-semibold text-text-secondary">Name</span>
                  </div>
                  
                  {/* Scrollable Results */}
                  <div className="flex-1 overflow-y-auto border border-border-subtle rounded-b-xl">
                    <div className="divide-y divide-border-subtle">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="px-4 py-4 flex items-center gap-3">
                          <Skeleton className="h-4 w-48" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : loadError ? (
                <Card className="p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <p className="text-error mb-4">Failed to load models</p>
                    <Button onClick={() => refetch()} size="sm">
                      Try Again
                    </Button>
                  </div>
                </Card>
              ) : filteredModels.length === 0 ? (
                <Card className="p-12 text-center h-full flex items-center justify-center">
                  {searchQuery ? (
                    <div>
                      <Search size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        No models match your search
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Try adjusting your search terms
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Database size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        Add Your First Model
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Models are AI language models that power your agents
                      </p>
                      <Button
                        icon={<Plus size={16} />}
                        onClick={handleCreateModel}
                      >
                        Add Model
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 px-4 py-3 bg-surface-elevated rounded-t-xl border border-border-subtle border-b-0">
                    <span className="text-sm font-semibold text-text-secondary">Name</span>
                  </div>
                  
                  {/* Scrollable Results */}
                  <div className="flex-1 overflow-y-auto border border-border-subtle rounded-b-xl">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {filteredModels.map((model) => (
                        <ModelTableRow
                          key={model.id}
                          model={model}
                          onView={() => handleViewModel(model.id)}
                          onEdit={() => handleEditModel(model.id)}
                          onDelete={() => handleDeleteModel(model)}
                          isDeleting={deleteModelMutation.isPending}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

// Model Table Row Component
interface ModelTableRowProps {
  model: Model
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

function ModelTableRow({
  model,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: ModelTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        opacity: { duration: 0.15 }
      }}
      onClick={onView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-surface-hover transition-colors cursor-pointer px-4 py-4 flex items-center justify-between border-b border-border-subtle last:border-b-0"
    >
      <span className="font-medium text-text-primary text-sm truncate">{model.name}</span>
      
      {/* Always reserve space for buttons to prevent layout shift */}
      <div className="flex items-center gap-2 min-w-[80px] justify-end">
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Edit model"
              >
                <Edit2 size={14} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1.5 rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                aria-label="Delete model"
              >
                <Trash2 size={14} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
