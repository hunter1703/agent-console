/**
 * Performance Optimization Utilities
 * Hooks and helpers for better runtime performance
 */

import { useEffect, useRef, useCallback, useMemo, useState } from "react";

// ============================================================================
// Hooks
// ============================================================================

/**
 * Debounce a value - useful for search inputs
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Check if component is mounted
 */
export function useIsMounted(): () => boolean {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
}

/**
 * Store previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Virtual scroll hook for large lists
 */
export function useVirtualScroll<T>({
    items,
    itemHeight,
    containerHeight,
    overscan = 5,
}: {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}) {
    const [scrollTop, setScrollTop] = useState(0);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

    const visibleItems = useMemo(
        () => items.slice(startIndex, endIndex + 1),
        [items, startIndex, endIndex]
    );

    const offsetY = startIndex * itemHeight;

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return {
        visibleItems,
        totalHeight,
        offsetY,
        handleScroll,
        startIndex,
        endIndex,
    };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver<T extends Element>(
    options?: IntersectionObserverInit
): [React.RefObject<T>, boolean] {
    const ref = useRef<T>(null as unknown as T);
    const [isIntersecting, setIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIntersecting(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [options]);

    return [ref as unknown as React.RefObject<T>, isIntersecting];
}

/**
 * Request Animation Frame hook for smooth animations
 */
export function useRafCallback(callback: () => void): () => void {
    const frameRef = useRef<number | undefined>(undefined);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
    }, []);

    useEffect(() => cancel, [cancel]);

    return useCallback(() => {
        cancel();
        frameRef.current = requestAnimationFrame(() => {
            callbackRef.current();
        });
    }, [cancel]);
}

// ============================================================================
// Memoization Helpers
// ============================================================================

/**
 * Create a stable reference for objects
 */
export function useStableObject<T extends object>(obj: T): T {
    const ref = useRef(obj);

    useEffect(() => {
        ref.current = obj;
    }, [obj]);

    return ref.current;
}

/**
 * Create a stable reference for arrays
 */
export function useStableArray<T>(arr: T[]): T[] {
    const ref = useRef(arr);

    useEffect(() => {
        ref.current = arr;
    }, [arr]);

    return ref.current;
}
