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
  BookOpen,
  FolderOpen,
  Terminal,
  Database,
  FileText,
  Bot,
  MessageSquare,
  Cpu,
  Layers,
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
  read_knowledge_source: {
    displayName: 'Read Knowledge Source',
    description: 'Reading knowledge base document',
    icon: BookOpen,
    color: '#6366F1', // Indigo
    background: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    category: 'research',
  },
  query_knowledge_source: {
    displayName: 'Query Knowledge',
    description: 'Querying knowledge engine repository',
    icon: Database,
    color: '#06B6D4', // Cyan
    background: 'rgba(6, 182, 212, 0.06)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    category: 'research',
  },
  search_knowledge: {
    displayName: 'Search Knowledge',
    description: 'Searching stored knowledge articles',
    icon: Database,
    color: '#6366F1',
    background: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    category: 'research',
  },
  knowledge_search: {
    displayName: 'Knowledge Search',
    description: 'Searching knowledge documents',
    icon: BookOpen,
    color: '#6366F1',
    background: 'rgba(99, 102, 241, 0.06)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    category: 'research',
  },
  open_file: {
    displayName: 'Open File',
    description: 'Opening file and media asset',
    icon: FolderOpen,
    color: '#3B82F6',
    background: 'rgba(59, 130, 246, 0.06)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    category: 'other',
  },
  execute_code: {
    displayName: 'Execute Code',
    description: 'Running code script',
    icon: Terminal,
    color: '#10B981',
    background: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    category: 'other',
  },
  bash: {
    displayName: 'Bash Command',
    description: 'Executing terminal command',
    icon: Terminal,
    color: '#10B981',
    background: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    category: 'other',
  },
  shell: {
    displayName: 'Shell Execution',
    description: 'Executing shell script',
    icon: Terminal,
    color: '#10B981',
    background: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    category: 'other',
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
 * Returns smart fallback config for unknown tools based on tool name patterns
 */
export function getToolConfig(toolName: string): ToolConfig {
  if (TOOL_CONFIGS[toolName]) {
    return TOOL_CONFIGS[toolName]
  }

  const normalized = (toolName || '').toLowerCase()
  
  // Format display name nicely
  const displayName = toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Smart keyword inference
  if (normalized.includes('knowledge') || normalized.includes('doc') || normalized.includes('read_source')) {
    return {
      displayName,
      description: `Reading knowledge source`,
      icon: BookOpen,
      color: '#6366F1',
      background: 'rgba(99, 102, 241, 0.06)',
      borderColor: 'rgba(99, 102, 241, 0.25)',
      category: 'research',
    }
  }

  if (normalized.includes('agent') || normalized.includes('spawn')) {
    return {
      displayName,
      description: `Managing agent workflow`,
      icon: GitBranch,
      color: '#8B5CF6',
      background: 'rgba(139, 92, 246, 0.06)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      category: 'agent',
    }
  }

  if (normalized.includes('search') || normalized.includes('find') || normalized.includes('web') || normalized.includes('browse')) {
    return {
      displayName,
      description: `Searching information`,
      icon: Globe,
      color: '#0EA5E9',
      background: 'rgba(14, 165, 233, 0.06)',
      borderColor: 'rgba(14, 165, 233, 0.25)',
      category: 'research',
    }
  }

  if (normalized.includes('message') || normalized.includes('send') || normalized.includes('chat')) {
    return {
      displayName,
      description: `Messaging communication`,
      icon: Send,
      color: '#3B82F6',
      background: 'rgba(59, 130, 246, 0.06)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      category: 'agent',
    }
  }

  if (normalized.includes('code') || normalized.includes('exec') || normalized.includes('shell') || normalized.includes('bash') || normalized.includes('run')) {
    return {
      displayName,
      description: `Executing script or command`,
      icon: Terminal,
      color: '#10B981',
      background: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      category: 'other',
    }
  }

  if (normalized.includes('db') || normalized.includes('sql') || normalized.includes('data') || normalized.includes('query')) {
    return {
      displayName,
      description: `Querying database`,
      icon: Database,
      color: '#EC4899',
      background: 'rgba(236, 72, 153, 0.06)',
      borderColor: 'rgba(236, 72, 153, 0.25)',
      category: 'research',
    }
  }

  if (normalized.includes('file') || normalized.includes('folder') || normalized.includes('asset')) {
    return {
      displayName,
      description: `Accessing file asset`,
      icon: FolderOpen,
      color: '#F59E0B',
      background: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      category: 'other',
    }
  }

  if (normalized.includes('wait') || normalized.includes('await') || normalized.includes('sleep') || normalized.includes('time')) {
    return {
      displayName,
      description: `Waiting for process`,
      icon: Clock,
      color: '#F59E0B',
      background: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      category: 'agent',
    }
  }
  
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
