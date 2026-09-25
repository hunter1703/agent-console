/**
 * Tool Configuration Map
 * 
 * Centralized configuration for all agent tool displays.
 * Each tool has a unique visual identity with specific colors, icons, and descriptions.
 * 
 * Design Philosophy:
 * - Each tool has distinct visual identity
 * - Colors convey tool category and purpose
 * - Icons are immediately recognizable
 * - Descriptions are concise and clear
 */

import { 
  GitBranch, 
  Send, 
  Clock, 
  Search,
  Globe,
  LucideIcon,
} from 'lucide-react'

export interface ToolConfig {
  displayName: string
  description: string
  icon: LucideIcon
  color: string
  background: string
  borderColor: string
  category: 'agent' | 'research' | 'other'
}

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  spawn_agent: {
    displayName: 'Spawn Agent',
    description: 'Creating new child agent session',
    icon: GitBranch,
    color: '#8B5CF6', // Purple
    background: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    category: 'agent',
  },
  send_message: {
    displayName: 'Send Message',
    description: 'Sending message to child session',
    icon: Send,
    color: '#3B82F6', // Blue
    background: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    category: 'agent',
  },
  await_agent: {
    displayName: 'Await Agent',
    description: 'Waiting for child agent to complete',
    icon: Clock,
    color: '#F59E0B', // Amber
    background: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    category: 'agent',
  },
  web_research: {
    displayName: 'Web Research',
    description: 'Searching the web for information',
    icon: Search,
    color: '#10B981', // Green
    background: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    category: 'research',
  },
  brave_web_search: {
    displayName: 'Brave Web Search',
    description: 'Searching the web with Brave Search',
    icon: Search,
    color: '#FB542B', // Brave Orange
    background: 'rgba(251, 84, 43, 0.06)',
    borderColor: 'rgba(251, 84, 43, 0.25)',
    category: 'research',
  },
  brave_search: {
    displayName: 'Brave Search',
    description: 'Searching the web with Brave Search',
    icon: Search,
    color: '#FB542B',
    background: 'rgba(251, 84, 43, 0.06)',
    borderColor: 'rgba(251, 84, 43, 0.25)',
    category: 'research',
  },
  web_search: {
    displayName: 'Web Search',
    description: 'Searching the web for live information',
    icon: Globe,
    color: '#0EA5E9', // Sky Blue
    background: 'rgba(14, 165, 233, 0.06)',
    borderColor: 'rgba(14, 165, 233, 0.25)',
    category: 'research',
  },
  google_search: {
    displayName: 'Google Search',
    description: 'Searching the web with Google Search',
    icon: Globe,
    color: '#4285F4', // Google Blue
    background: 'rgba(66, 133, 244, 0.06)',
    borderColor: 'rgba(66, 133, 244, 0.25)',
    category: 'research',
  },
  duckduckgo_search: {
    displayName: 'DuckDuckGo Search',
    description: 'Searching privately with DuckDuckGo',
    icon: Search,
    color: '#DE5833',
    background: 'rgba(222, 88, 51, 0.06)',
    borderColor: 'rgba(222, 88, 51, 0.25)',
    category: 'research',
  },
  tavily_search: {
    displayName: 'Tavily Search',
    description: 'AI-tailored web search with Tavily',
    icon: Search,
    color: '#6366F1',
    background: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    category: 'research',
  },
}

// Fallback configuration for unknown tools
const FALLBACK_CONFIG: ToolConfig = {
  displayName: 'Tool Execution',
  description: 'Executing tool',
  icon: Search,
  color: '#6B7280', // Gray
  background: 'rgba(107, 114, 128, 0.05)',
  borderColor: 'rgba(107, 114, 128, 0.2)',
  category: 'other',
}

/**
 * Get tool configuration by tool name
 * Returns fallback config for unknown tools with the actual tool name
 */
export function getToolConfig(toolName: string): ToolConfig {
  if (TOOL_CONFIGS[toolName]) {
    return TOOL_CONFIGS[toolName]
  }
  
  // Return fallback with actual tool name formatted nicely
  const displayName = toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    ...FALLBACK_CONFIG,
    displayName,
    description: `Executing ${displayName}`,
  }
}

/**
 * Get all tool configs by category
 */
export function getToolsByCategory(category: ToolConfig['category']): Record<string, ToolConfig> {
  return Object.entries(TOOL_CONFIGS)
    .filter(([_, config]) => config.category === category)
    .reduce((acc, [name, config]) => ({ ...acc, [name]: config }), {})
}

/**
 * Check if tool name is valid
 */
export function isValidTool(toolName: string): boolean {
  return toolName in TOOL_CONFIGS
}
