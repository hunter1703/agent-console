/**
 * Type definitions for backend schema system
 * 
 * These types match the Java classes in:
 * agent-engine/util/common/src/main/java/com/agentengine/util/common/builder/
 */

import type { JSONSchema7 } from '@types/json-schema'

/**
 * Response from GET /schemas/{assetType}?mode={mode}
 */
export interface BuilderDefinition {
  schema: JSONSchema7        // Standard JSON Schema for validation
  layout: UILayout           // UI rendering metadata
}

/**
 * UI Layout metadata for form rendering
 */
export interface UILayout {
  fields: Record<string, LayoutField>  // JSON Pointer → Field config
  presets?: LayoutPreset[]             // Quick-fill templates
  steps?: LayoutStep[]                 // Ordered steps with sections
}

/**
 * Quick-fill template for forms
 */
export interface LayoutPreset {
  id: string
  label: string
  description?: string
  values: Record<string, any>
}

/**
 * Step definition from backend @UiStep annotation
 */
export interface LayoutStep {
  id: string
  label: string
  description?: string
  order: number
  sections?: LayoutSection[]
}

/**
 * Section definition from backend @UiSection annotation
 */
export interface LayoutSection {
  id: string
  label: string
  description?: string
  order: number
}

/**
 * Preset definition (from backend @UiPreset annotation)
 */
export interface Preset {
  id: string
  label: string
  description?: string
  isDefault?: boolean
  preset: string  // JSON string of default values
}

/**
 * Field configuration for UI rendering
 */
export interface LayoutField {
  label: string                        // Display label
  widget: WidgetType                   // Widget type to render
  step: string                         // Wizard step grouping
  section: string                      // Section within step
  order: number                        // Sort order
  access: {                            // Access per mode
    create: AccessLevel
    edit: AccessLevel
    view: AccessLevel
  }
  currentAccess: AccessLevel           // Resolved for current mode
  rules?: LayoutFieldRule[]            // Conditional visibility/enabled/required
  collection?: boolean                 // Is array field
  multiline?: boolean                  // For TEXT widget
  rows?: number                        // For TEXTAREA
  numberType?: 'integer' | 'decimal'   // For NUMBER widget
  options?: string[]                   // For SELECT widget
  lookup?: {                           // For LOOKUP widget
    assetType: string                  // 'agent' | 'model'
    multiSelect?: boolean
  }
  dynamicSchema?: {                    // For DYNAMIC_SCHEMA widget
    url: string                        // API endpoint
    method: string                     // HTTP method
    body: Record<string, any>          // Request body template
  }
  presets?: FieldPreset[]              // Field-level presets (quick-fill for this field)
  sensitive?: boolean                  // Mask value
  advanced?: boolean                   // Can be collapsed
  helpText?: string                    // Help text to display
  description?: string                 // Field description
}

/**
 * Field-level preset (quick-fill for individual field)
 */
export interface FieldPreset {
  id: string
  label: string
  description?: string
  value: any  // The value to set for this field
}

/**
 * Access level for fields
 */
export type AccessLevel = 'HIDDEN' | 'READ_ONLY' | 'EDITABLE' | 'REQUIRED'

/**
 * Widget types supported by the form renderer
 */
export type WidgetType = 
  | 'TEXT' 
  | 'TEXTAREA' 
  | 'NUMBER' 
  | 'SELECT' 
  | 'SWITCH' 
  | 'LOOKUP' 
  | 'DYNAMIC_SCHEMA'

/**
 * Conditional rule for field visibility/enabled/required
 */
export interface LayoutFieldRule {
  effect: RuleEffect
  expr: JsonLogicExpression            // JSON Logic expression
}

/**
 * Rule effect types
 */
export type RuleEffect = 'VISIBLE' | 'ENABLED' | 'REQUIRED'

/**
 * JSON Logic expression
 * See: http://jsonlogic.com/
 * 
 * Examples:
 * - { "===": [{ "var": "type" }, "ORCHESTRATOR"] }
 * - { "and": [{ "var": "enabled" }, { ">": [{ "var": "count" }, 0] }] }
 */
export type JsonLogicExpression = 
  | { [operator: string]: any }
  | any[]
  | string
  | number
  | boolean
  | null

/**
 * Builder mode for schema fetching
 */
export type BuilderMode = 'CREATE' | 'EDIT' | 'VIEW'

/**
 * Asset types supported by the schema API
 */
export type AssetType = 'Agent' | 'Model' | string

/**
 * Grouped fields by section
 */
export interface FieldSection {
  name: string
  fields: Array<{
    pointer: string
    field: LayoutField
  }>
}

/**
 * Grouped sections by step
 */
export interface FieldStep {
  name: string
  sections: FieldSection[]
}

/**
 * Field state computed from rules
 */
export interface FieldState {
  visible: boolean
  enabled: boolean
  required: boolean
}

/**
 * Form validation error
 */
export interface FormError {
  pointer: string
  message: string
}

/**
 * Form submission data
 */
export interface FormData {
  [key: string]: any
}
