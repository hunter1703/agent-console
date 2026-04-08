/**
 * Classname utility
 * 
 * Combines clsx and tailwind-merge for optimal className handling.
 * Use this for all className concatenation to avoid Tailwind conflicts.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
