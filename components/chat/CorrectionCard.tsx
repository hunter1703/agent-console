'use client'

import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import type { CorrectionEvent } from '../../lib/store/chat'

interface CorrectionCardProps {
  correction: CorrectionEvent
  onDismiss?: () => void
}

const CorrectionCardComponent = function CorrectionCard({ correction, onDismiss }: CorrectionCardProps) {
  return (
    <Card className="border-l-4 border-l-warning bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-text-primary">
              Correction
            </h4>
            {correction.code && (
              <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md font-mono">
                {correction.code}
              </span>
            )}
          </div>
          
          <p className="text-sm text-text-secondary leading-relaxed">
            {correction.message}
          </p>
          
          {correction.correctionType && correction.correctionType !== 'violation' && (
            <div className="mt-2">
              <span className="text-xs text-text-tertiary">
                Type: {correction.correctionType}
              </span>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-text-tertiary hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
function areCorrectionCardPropsEqual(prev: CorrectionCardProps, next: CorrectionCardProps) {
  return JSON.stringify(prev.correction) === JSON.stringify(next.correction)
}

export const CorrectionCard = React.memo(CorrectionCardComponent, areCorrectionCardPropsEqual)
