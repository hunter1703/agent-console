'use client'

/**
 * Agents Table Component
 * 
 * Displays agents in a paginated table format with action icons.
 * Features colored/animated icons for chat, edit, and delete actions.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/markdown/Table'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface Agent {
  id: string
  name: string
  description?: string
  avatarUrl?: string
}

interface AgentsTableProps {
  agents: Agent[]
  onChatClick: (agentId: string) => void
  pageSize?: number
  className?: string
}

export function AgentsTable({ 
  agents, 
  onChatClick, 
  pageSize = 10,
  className 
}: AgentsTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  
  const totalPages = Math.ceil(agents.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, agents.length)
  const currentAgents = agents.slice(startIndex, endIndex)
  
  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < totalPages - 1
  
  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  const handleNext = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <Table className="my-0">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Agent</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentAgents.map((agent, index) => (
            <motion.tr
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springPresets.default, delay: index * 0.03 }}
              className="group hover:bg-surface-hover transition-colors cursor-pointer"
              onClick={() => onChatClick(agent.id)}
              data-testid="agent-row"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={agent.avatarUrl}
                    name={agent.name}
                    size="sm"
                    variant="agent"
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {agent.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {agent.description || 'No description available'}
                </p>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-text-tertiary">
            Showing {startIndex + 1}-{endIndex} of {agents.length} agents
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              aria-label="Previous page"
              className="!px-2"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <span className="text-sm text-text-secondary px-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Next page"
              className="!px-2"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
