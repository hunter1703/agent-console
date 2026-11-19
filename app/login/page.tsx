'use client'

import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* Background patterns and gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-primary/20 dark:bg-primary-hover/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 dark:opacity-20" />
      </div>

      {/* Login form container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full flex justify-center p-4"
      >
        <LoginForm />
      </motion.div>
    </div>
  )
}
