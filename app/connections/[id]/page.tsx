'use client'

/**
 * Connection View/Edit Page
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageTransition } from '@/components/common/PageTransition'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { getConnection, saveConnection, type Connection } from '@/lib/api/connections'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function ConnectionPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)

  const connectionId = params.id as string

  const {
    data: connection,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['connections', connectionId],
    queryFn: () => getConnection(connectionId),
    enabled: !!connectionId,
  })

  // The stored connection is saved over with the form's values, so its id and version go with them.
  const updateConnectionMutation = useMutation({
    mutationFn: (data: Record<string, any>) =>
      saveConnection({ ...(connection as Connection), ...data }),
    onSuccess: () => {
      success('Connection updated successfully')
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      router.push('/connections')
    },
    onError: (err: any) => {
      showError('Failed to update connection', err.message)
    },
  })

  useEffect(() => {
    const title = connection ? `${connection.name} - Connection` : 'Connection'
    document.title = title
    setPageTitle(title)
  }, [connection, setPageTitle])

  if (isLoading) {
    return (
      <PageTransition pageKey={connectionId}>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-text-secondary">Loading connection...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (loadError || !connection) {
    return (
      <PageTransition pageKey={connectionId}>
        <div className="h-full flex flex-col bg-background">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
            <div className="mb-12" />
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-error mb-4">Connection Not Available</h2>
              <p className="text-text-secondary mb-6">
                {(loadError as any)?.message ||
                  'The connection does not exist, or you cannot read it.'}
              </p>
              <Button onClick={() => router.push('/connections')}>Back to Connections</Button>
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition pageKey={connectionId} className="h-full">
      <div className="h-full flex flex-col bg-background">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-6">
          <div className="flex-shrink-0 pt-12 pb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/connections')}
                className="p-2"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-3xl font-bold text-text-primary">{connection.name}</h1>
            </div>
          </div>

          <div className="flex-1 min-h-0 pb-8">
            <div className="h-full overflow-y-auto">
              <Card className="p-8">
                <DynamicForm
                  assetType="Connection"
                  mode="EDIT"
                  initialData={connection}
                  onSubmit={async data => {
                    await updateConnectionMutation.mutateAsync(data)
                  }}
                  onCancel={() => router.push('/connections')}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
