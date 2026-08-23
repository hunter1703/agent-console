'use client'

/**
 * Schedule Agent Page
 *
 * Create and manage recurring cron-triggered invocations of a single agent.
 */

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, Trash2 } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input, Textarea } from '@/components/common/Input'
import { Checkbox } from '@/components/common/Checkbox'
import { Skeleton } from '@/components/common/Skeleton'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/markdown/Table'

import {
  getAgent,
  scheduleAgent,
  listAgentSchedules,
  cancelAgentSchedule,
  type JobDefinition,
} from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useToasts, useDialogs } from '@/lib/store/ui'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { springPresets } from '@/lib/constants/animations'

export default function ScheduleAgentPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.agentId as string
  const queryClient = useQueryClient()
  const { success, error } = useToasts()
  const { danger } = useDialogs()

  const [cron, setCron] = useState('')
  const [message, setMessage] = useState('')
  const [singletonSession, setSingletonSession] = useState(false)

  const { data: agent, isLoading: isAgentLoading } = useQuery({
    queryKey: queryKeys.agents.detail(agentId),
    queryFn: () => getAgent(agentId),
  })

  const {
    data: schedules,
    isLoading: isSchedulesLoading,
    error: schedulesError,
  } = useQuery({
    queryKey: queryKeys.schedules.list(agentId),
    queryFn: () => listAgentSchedules(agentId),
  })

  const scheduleMutation = useMutation({
    mutationFn: () => scheduleAgent(agentId, { cron, message, singletonSession }),
    onSuccess: () => {
      success('Schedule created')
      setCron('')
      setMessage('')
      setSingletonSession(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.list(agentId) })
    },
    onError: (err: any) => {
      error('Failed to create schedule', err.message)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (jobId: string) => cancelAgentSchedule(jobId),
    onSuccess: () => {
      success('Schedule cancelled')
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.list(agentId) })
    },
    onError: (err: any) => {
      error('Failed to cancel schedule', err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cron.trim() || !message.trim()) return
    scheduleMutation.mutate()
  }

  const handleCancel = (job: JobDefinition) => {
    danger(
      'Cancel Schedule',
      `Cancel the "${job.cronSchedule}" schedule? This action cannot be undone.`,
      () => cancelMutation.mutate(job.id)
    )
  }

  if (isAgentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse mx-auto mb-4" />
          <p className="text-text-secondary">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Agent Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">
            The requested agent could not be found.
          </p>
          <Button onClick={() => router.push('/agents')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Agents
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.push('/agents')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-base font-semibold text-text-primary">Schedule: {agent.name}</h1>
            <p className="text-xs text-text-tertiary">
              Invoke this agent repeatedly on a cron schedule
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">New schedule</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Cron expression"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="0 0 9 * * ?"
              helperText="Quartz cron format, e.g. '0 0 9 * * ?' for daily at 9am"
              disabled={scheduleMutation.isPending}
            />
            <Textarea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message to send the agent on each firing"
              disabled={scheduleMutation.isPending}
            />
            <Checkbox
              checked={singletonSession}
              onChange={setSingletonSession}
              label="Continue the same session across firings"
              disabled={scheduleMutation.isPending}
            />
            <Button
              type="submit"
              icon={<Clock size={16} />}
              disabled={!cron.trim() || !message.trim() || scheduleMutation.isPending}
              loading={scheduleMutation.isPending}
            >
              Create Schedule
            </Button>
          </form>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Scheduled jobs</h2>
          {isSchedulesLoading ? (
            <Card className="p-4">
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </Card>
          ) : schedulesError ? (
            <Card className="p-8 text-center">
              <p className="text-error">Failed to load scheduled jobs</p>
            </Card>
          ) : !schedules || schedules.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-text-secondary">No scheduled jobs yet</p>
            </Card>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Cron</TableHeaderCell>
                  <TableHeaderCell>Message</TableHeaderCell>
                  <TableHeaderCell>Session</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell align="right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {schedules.map((job) => (
                    <ScheduleTableRow
                      key={job.id}
                      job={job}
                      onCancel={() => handleCancel(job)}
                      isCancelling={cancelMutation.isPending}
                    />
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

interface ScheduleTableRowProps {
  job: JobDefinition
  onCancel: () => void
  isCancelling: boolean
}

function ScheduleTableRow({ job, onCancel, isCancelling }: ScheduleTableRowProps) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springPresets.default}
      className="group hover:bg-surface-hover transition-colors"
    >
      <TableCell>
        <code className="text-sm text-text-primary">{job.cronSchedule}</code>
      </TableCell>
      <TableCell>
        <div className="text-text-secondary max-w-md truncate" title={job.payload.message}>
          {job.payload.message}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-text-tertiary text-sm">
          {job.payload.singletonSession ? 'Shared' : 'Fresh each time'}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-text-tertiary text-sm">
          {job.createdTime ? formatRelativeTime(job.createdTime) : '—'}
        </span>
      </TableCell>
      <TableCell align="right">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isCancelling}
          className="p-1.5 opacity-60 hover:opacity-100 text-error hover:text-error hover:bg-error/10 transition-opacity"
          aria-label="Cancel schedule"
        >
          <Trash2 size={14} />
        </Button>
      </TableCell>
    </motion.tr>
  )
}
