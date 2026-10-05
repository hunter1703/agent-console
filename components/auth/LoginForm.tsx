'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/lib/store/auth'
import { useUIStore } from '@/lib/store/ui'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const addToast = useUIStore(state => state.addToast)
  
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      await login(data.username, data.password)
      addToast({
        type: 'success',
        title: 'Login successful',
        message: 'Welcome back to Agent Console.'
      })
      router.push('/dashboard')
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: error.message || 'Invalid username or password.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* Decorative gradient orb */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/30"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Sign in to access your AI agents and workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                {...register('username', { required: 'Username is required' })}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Enter your username"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <label className="flex items-center text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary mr-2" />
              Remember me
            </label>
            <a href="#" className="text-primary hover:text-primary-hover font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-hover hover:to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
