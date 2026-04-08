/**
 * Icon System
 * 
 * Centralized icon mappings using Lucide React.
 * All icons use consistent 2px stroke width and follow the design system.
 */

import {
  // Navigation
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  
  // Actions
  Send,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  
  // Content
  MessageSquare,
  Users,
  User,
  Settings,
  Search,
  Filter,
  MoreVertical,
  MoreHorizontal,
  
  // Theme
  Sun,
  Moon,
  
  // Status
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  
  // Media
  Image,
  File,
  FileText,
  Code,
  
  // Planning
  Circle,
  CheckCircle2,
  
  // Session & Agent Tools
  GitBranch,
  Layers,
  Clock,
  Link,
  
  // Misc
  Bell,
  Zap,
  Heart,
  Star,
  Bookmark,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react'

export const icons = {
  // Navigation
  menu: Menu,
  close: X,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  
  // Actions
  send: Send,
  plus: Plus,
  edit: Edit2,
  trash: Trash2,
  copy: Copy,
  check: Check,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  
  // Content
  messageSquare: MessageSquare,
  users: Users,
  user: User,
  settings: Settings,
  search: Search,
  filter: Filter,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  
  // Theme
  sun: Sun,
  moon: Moon,
  
  // Status
  loader: Loader2,
  alertCircle: AlertCircle,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  info: Info,
  helpCircle: HelpCircle,
  alertTriangle: AlertTriangle,
  
  // Media
  image: Image,
  file: File,
  fileText: FileText,
  code: Code,
  
  // Planning
  circle: Circle,
  checkCircle2: CheckCircle2,
  
  // Session & Agent Tools
  gitBranch: GitBranch,
  layers: Layers,
  clock: Clock,
  link: Link,
  
  // Misc
  bell: Bell,
  zap: Zap,
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  eye: Eye,
  eyeOff: EyeOff,
  lock: Lock,
  unlock: Unlock,
} as const

// Icon sizes (px)
export const iconSizes = {
  xs: 14,   // Inline with small text, badges
  sm: 16,   // Inline with body text, small buttons
  md: 20,   // Navigation, primary actions, standard buttons
  lg: 24,   // Large buttons, headings, feature icons
  xl: 32,   // Hero sections, empty states
  '2xl': 48, // Large empty states, illustrations
} as const

// Icon colors (semantic)
export const iconColors = {
  // Default states
  default: 'currentColor',
  
  // Semantic colors (will be replaced with theme values)
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const

export type IconName = keyof typeof icons
export type IconSize = keyof typeof iconSizes
