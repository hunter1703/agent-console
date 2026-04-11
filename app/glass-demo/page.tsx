'use client'

import { useState } from 'react'
import { Check, X, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'

export default function GlassDemoPage() {
  const [binaryChoice, setBinaryChoice] = useState<'approve' | 'decline' | null>(null)
  const [multiChoice, setMultiChoice] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  const handleBinarySubmit = (choice: 'approve' | 'decline') => {
    setBinaryChoice(choice)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)
  }

  const handleMultiSubmit = () => {
    if (multiChoice) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2500)
    }
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg-glassmorphism.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-4">
            <Sparkles className="w-5 h-5 text-blue-300" />
            <h1 className="text-2xl font-bold text-white">Glassmorphism HITL Demo</h1>
          </div>
          <p className="text-white/80 text-sm">Human-in-the-Loop confirmations with frosted glass design</p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* Binary Decision Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {showConfetti && binaryChoice && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                <ConfettiExplosion
                  force={0.4}
                  duration={2200}
                  particleCount={30}
                  width={400}
                  colors={binaryChoice === 'approve' ? ['#3B82F6', '#60A5FA', '#93C5FD'] : ['#A855F7', '#C084FC', '#D8B4FE']}
                />
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Binary Decision</h3>
              <p className="text-white/70 text-sm mb-4">Approve or decline this action</p>
              
              {!binaryChoice ? (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBinarySubmit('approve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)] hover:bg-blue-500/30 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-white">Approve</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBinarySubmit('decline')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 backdrop-blur-md border border-purple-400/30 shadow-[0_8px_32px_0_rgba(168,85,247,0.2)] hover:bg-purple-500/30 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 text-white" strokeWidth={2.5} />
                    <span className="text-sm font-medium text-white">Decline</span>
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl backdrop-blur-md border ${
                    binaryChoice === 'approve'
                      ? 'bg-blue-500/20 border-blue-400/30'
                      : 'bg-purple-500/20 border-purple-400/30'
                  }`}
                >
                  {binaryChoice === 'approve' ? (
                    <Check className="w-4 h-4 text-blue-200" strokeWidth={2.5} />
                  ) : (
                    <X className="w-4 h-4 text-purple-200" strokeWidth={2.5} />
                  )}
                  <span className="text-sm font-medium text-white">
                    {binaryChoice === 'approve' ? 'Approved' : 'Declined'}
                  </span>
                </motion.div>
              )}

              <button
                onClick={() => setBinaryChoice(null)}
                className="mt-3 w-full text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Multiple Choice Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {showConfetti && multiChoice && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                <ConfettiExplosion
                  force={0.4}
                  duration={2200}
                  particleCount={30}
                  width={400}
                  colors={['#3B82F6', '#60A5FA', '#93C5FD']}
                />
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Choice</h3>
              <p className="text-white/70 text-sm mb-4">Select one option</p>
              
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden mb-3">
                {['Option A', 'Option B', 'Option C'].map((option, index) => (
                  <div key={option}>
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMultiChoice(option)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        multiChoice === option
                          ? 'bg-blue-400/80 backdrop-blur-sm'
                          : 'bg-white/20 ring-1 ring-white/30'
                      }`}>
                        {multiChoice === option && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        multiChoice === option ? 'text-white' : 'text-white/80'
                      }`}>
                        {option}
                      </span>
                    </motion.button>
                    {index < 2 && (
                      <div className="px-4">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMultiSubmit}
                disabled={!multiChoice}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)] hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="text-sm font-medium text-white">Submit</span>
              </motion.button>

              <button
                onClick={() => setMultiChoice(null)}
                className="mt-3 w-full text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>

          {/* Text Input Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {showConfetti && textInput && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                <ConfettiExplosion
                  force={0.4}
                  duration={2200}
                  particleCount={30}
                  width={400}
                  colors={['#3B82F6', '#60A5FA', '#93C5FD']}
                />
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Text Confirmation</h3>
              <p className="text-white/70 text-sm mb-4">Provide your response</p>
              
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-3 mb-3">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full bg-transparent border-none text-sm text-white placeholder:text-white/50 focus:outline-none resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)] hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="text-sm font-medium text-white">Submit</span>
              </motion.button>

              <button
                onClick={() => setTextInput('')}
                className="mt-3 w-full text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>

        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Glassmorphism Features</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Backdrop blur:</strong> Creates frosted glass effect</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Semi-transparent:</strong> Layers blend with background</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Subtle borders:</strong> Defines edges without harshness</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Confetti animations:</strong> Delightful feedback on submission</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
