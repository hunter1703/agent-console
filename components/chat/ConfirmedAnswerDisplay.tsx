'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'

interface ConfirmedAnswerDisplayProps {
  confirmed: boolean
  answer?: string
}

export function ConfirmedAnswerDisplay({ confirmed, answer }: ConfirmedAnswerDisplayProps) {
  // If rejected with no answer, show nothing
  if (!confirmed && !answer) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.default}
      className={`
        px-4 py-3 rounded-lg border
        ${confirmed 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-rose-500/10 border-rose-500/20'
        }
      `}
    >
      {answer && (
        <div className="text-sm text-text-primary break-words leading-relaxed">{answer}</div>
      )}
    </motion.div>
  )
}
