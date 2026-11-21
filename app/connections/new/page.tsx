'use client'

/**
 * Connection Creation Page
 *
 * Creates a connection with the schema-driven form: the app is chosen first, and the auth types and
 * inputs below it follow from the app.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PageTransition } from '@/components/common/PageTransition'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { saveConnection, type Connection } from '@/lib/api/connections'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function NewConnectionPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)

  useEffect(() => {
    document.title = 'New Connection'
    setPageTitle('New Connection')
  }, [setPageTitle])

  const createConnectionMutation = useMutation({
    mutationFn: (data: Record<string, any>) => saveConnection(data as Connection),
    onSuccess: () => {
      success('Connection created successfully')
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      router.push('/connections')
    },
    onError: (err: any) => {
      showError('Failed to create connection', err.message)
    },
  })

  return (
    <PageTransition pageKey="new-connection" className="h-full">
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
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Create New Connection</h1>
                <p className="text-text-tertiary mt-1">
                  Set up how agents reach an external app or MCP server
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 pb-8">
            <div className="h-full overflow-y-auto">
              <Card className="p-8">
                <DynamicForm
                  assetType="Connection"
                  mode="CREATE"
                  initialData={{}}
                  onSubmit={async data => {
                    await createConnectionMutation.mutateAsync(data)
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
