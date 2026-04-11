import { useScroll, useTransform, MotionValue } from 'framer-motion'
import { RefObject } from 'react'

export interface UseParallaxOptions {
  speed?: number // 0.5 = half speed, 2 = double speed
  direction?: 'up' | 'down'
}

export function useParallax(
  ref: RefObject<HTMLElement>,
  options: UseParallaxOptions = {}
): MotionValue<number> {
  const { speed = 0.5, direction = 'up' } = options

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const multiplier = direction === 'up' ? -100 : 100
  const y = useTransform(scrollYProgress, [0, 1], [0, multiplier * speed])

  return y
}
