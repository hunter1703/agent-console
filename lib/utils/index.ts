/**
 * Utility Functions Library
 * Inspired by open-webui's utils - common helpers for the Agent Console
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(localizedFormat);

// ============================================================================
// Time & Date Utilities
// ============================================================================

/**
 * Format a timestamp to a relative time string (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(timestamp: number | string): string {
    if (!timestamp) return '';

    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

    if (!ts || ts === 0) return '';

    const now = Date.now();
    const diff = now - ts;

    // Handle future dates (shouldn't happen, but be safe)
    if (diff < 0) return 'just now';

    // Less than a minute
    if (diff < 60000) return 'just now';

    // Less than an hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Use dayjs for more complex formatting
    const date = dayjs(ts);

    if (date.isToday()) {
        return date.format('h:mm A');
    }

    if (date.isYesterday()) {
        return 'yesterday';
    }

    // Within last week
    if (diff < 604800000) {
        return date.format('dddd');
    }

    // Older
    return date.format('MMM D, YYYY');
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: number | string, format = 'MMM D, YYYY h:mm A'): string {
    if (!timestamp) return '';
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return dayjs(ts).format(format);
}

/**
 * Get a greeting based on the current time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Sanitize content by removing potentially harmful HTML tags
 */
export function sanitizeContent(content: string): string {
    return content
        .replace(/<\|[a-z]*$/, '')
        .replace(/<\|[a-z]+\|$/, '')
        .replace(/<$/, '')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll(/<\|[a-z]+\|>/g, ' ')
        .trim();
}

/**
 * Process response content for display
 */
export function processResponseContent(content: string): string {
    return sanitizeContent(content).trim();
}

/**
 * Extract text content from code blocks
 */
export function getCodeBlockContent(content: string): string {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = content.match(codeBlockRegex);
    if (!matches) return content;

    return matches
        .map((block) => {
            // Remove the ``` markers and language identifier
            const lines = block.split('\n');
            if (lines.length > 2) {
                return lines.slice(1, -1).join('\n');
            }
            return block.replace(/```/g, '').trim();
        })
        .join('\n');
}

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string, maxLength = 2): string {
    if (!name) return '';
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, maxLength)
        .toUpperCase();
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number, suffix = '…'): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
}

/**
 * Escape special characters for safe HTML display
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ============================================================================
// Clipboard Utilities
// ============================================================================

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        textArea.remove();
        return result;
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format a number with compact notation (e.g., 1500 -> "1.5K")
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(num);
}

/**
 * Generate a random ID (UUID-like)
 */
export function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (
                sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)
            ) {
                output[key] = deepMerge(targetValue, sourceValue as any) as any;
            } else if (sourceValue !== undefined) {
                (output as any)[key] = sourceValue;
            }
        }
    }

    return output;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            (result as any)[key] = obj[key];
        }
    }
    return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result as Omit<T, K>;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Remove duplicates from an array by a key
 */
export function uniqueBy<T extends Record<string, any>>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter((item) => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

/**
 * Move an item in an array from one index to another
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArray = [...array];
    const [item] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, item);
    return newArray;
}

/**
 * Chunk an array into smaller arrays of a specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYoutubeUrl(url: string): boolean {
    const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
}

/**
 * Extract YouTube video ID from a URL
 */
export function extractYoutubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// ============================================================================
// File Utilities
// ============================================================================

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from a filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Get file type category from extension
 */
export function getFileTypeCategory(filename: string): string {
    const ext = getFileExtension(filename);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'rb', 'php'];
    const dataExts = ['json', 'xml', 'yaml', 'yml', 'csv', 'sql'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (documentExts.includes(ext)) return 'document';
    if (codeExts.includes(ext)) return 'code';
    if (dataExts.includes(ext)) return 'data';
    return 'file';
}

// ============================================================================
// Browser Utilities
// ============================================================================

/**
 * Check if the current device is mobile
 */
export function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Check if the current device is iOS
 */
export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Get the current scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    return {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
    };
}

/**
 * Check if an element is in the viewport
 */
export function isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll to an element smoothly
 */
export function scrollToElement(element: HTMLElement, options?: ScrollIntoViewOptions): void {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
    });
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ============================================================================
// Storage Utilities
// ============================================================================

/**
 * Safely get item from localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
}

/**
 * Safely set item in localStorage
 */
export function setToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
    }
}

/**
 * Safely remove item from localStorage
 */
export function removeFromStorage(key: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
    }
}

// ============================================================================
// Debounce & Throttle
// ============================================================================

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// ============================================================================
// Sleep / Delay
// ============================================================================

/**
 * Create a promise that resolves after a delay
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Event Utilities
// ============================================================================

/**
 * Create an event target for custom events
 */
export function createEventTarget(): EventTarget {
    return new EventTarget();
}

/**
 * Dispatch a custom event
 */
export function dispatchCustomEvent(
    target: EventTarget,
    eventName: string,
    detail?: any
): void {
    const event = new CustomEvent(eventName, { detail });
    target.dispatchEvent(event);
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp)
    );
}
