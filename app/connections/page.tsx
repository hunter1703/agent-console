'use client'

/**
 * Connections Page
 *
 * List view of the connections an agent can use to reach an external app, such as an MCP server.
 */

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Plug, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { SearchInput } from '@/components/sidebar/SearchInput'
import { PageTransition } from '@/components/common/PageTransition'

import { listConnections, deleteConnection } from '@/lib/api/connections'
import { useUIStore, useToasts, useDialogs } from '@/lib/store/ui'

export default function ConnectionsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error } = useToasts()
  const { danger } = useDialogs()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.title = 'Connections'
    setPageTitle('Connections')
  }, [setPageTitle])

  const {
    data: connectionsData,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['connections', 'list'],
    queryFn: () => listConnections(),
    staleTime: 2 * 60 * 1000,
  })

  const deleteConnectionMutation = useMutation({
    mutationFn: (id: string) => deleteConnection(id),
    onSuccess: () => {
      success('Connection deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['connections'] })
    },
    onError: (err: any) => {
      error('Failed to delete connection', err.message)
    },
  })

  const connections = connectionsData?.items || []

  const filteredConnections = useMemo(
    () =>
      connections.filter(connection =>
        (connection.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [connections, searchQuery]
  )

  return (
    <PageTransition pageKey="connections" className="h-full">
      <div className="h-full flex flex-col bg-background overflow-hidden">
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full px-6">
          <div className="flex-shrink-0 pt-12 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-text-primary">Connections</h1>
                <p className="text-text-tertiary mt-2">
                  Manage how your agents reach external apps and MCP servers
                </p>
              </div>
              <Button
                icon={<Plus size={20} />}
                onClick={() => router.push('/connections/new')}
                className="w-full sm:w-auto"
              >
                Add New Connection
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search connections..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={setSearchQuery}
              />
            </div>
            <div className="text-sm text-text-tertiary">
              {filteredConnections.length} of {connections.length} connections
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col pb-8">
            {isLoading ? (
              <div className="flex-1 overflow-y-auto border border-border-subtle rounded-xl divide-y divide-border-subtle">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-4 py-4">
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <Card className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <p className="text-error mb-4">Failed to load connections</p>
                  <Button onClick={() => refetch()} size="sm">
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : filteredConnections.length === 0 ? (
              <Card className="p-12 text-center h-full flex items-center justify-center">
                {searchQuery ? (
                  <div>
                    <Search size={64} className="mx-auto text-text-tertiary mb-6" />
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                      No connections match your search
                    </h2>
                    <Button variant="ghost" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Plug size={64} className="mx-auto text-text-tertiary mb-6" />
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                      Add Your First Connection
                    </h2>
                    <p className="text-text-secondary mb-6">
                      A connection holds what an agent needs to reach an external app, such as an
                      MCP server
                    </p>
                    <Button
                      icon={<Plus size={16} />}
                      onClick={() => router.push('/connections/new')}
                    >
                      Add Connection
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <div className="flex-1 overflow-y-auto border border-border-subtle rounded-xl">
                {filteredConnections.map(connection => (
                  <div
                    key={connection.id}
                    onClick={() => router.push(`/connections/${connection.id}`)}
                    className="group hover:bg-surface-hover transition-colors cursor-pointer px-4 py-4 flex items-center justify-between border-b border-border-subtle last:border-b-0"
                  >
                    <span className="font-medium text-text-primary text-sm truncate">
                      {connection.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`/connections/${connection.id}`)
                        }}
                        className="p-1.5 rounded-md text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                        aria-label="Edit connection"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          danger(
                            'Delete Connection',
                            `Are you sure you want to delete "${connection.name}"? This action cannot be undone.`,
                            () => deleteConnectionMutation.mutate(connection.id as string)
                          )
                        }}
                        className="p-1.5 rounded-md text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                        aria-label="Delete connection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
