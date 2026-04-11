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
 * Returns fallback config for unknown tools
 */
export function getToolConfig(toolName: string): ToolConfig {
  return TOOL_CONFIGS[toolName] || FALLBACK_CONFIG
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
