/**
 * JSON Logic utility wrapper
 * 
 * Provides type-safe wrapper around json-logic-js library
 * See: http://jsonlogic.com/
 */

import jsonLogic from 'json-logic-js'
import type { JsonLogicExpression } from '@/lib/types/schema'

/**
 * Evaluate a JSON Logic expression against data
 * 
 * @param rule - JSON Logic expression
 * @param data - Data to evaluate against
 * @returns Result of evaluation (typically boolean)
 * 
 * @example
 * evaluateRule({ "===": [{ "var": "type" }, "ORCHESTRATOR"] }, { type: "ORCHESTRATOR" })
 * // Returns: true
 * 
 * @example
 * evaluateRule({ "and": [{ "var": "enabled" }, { ">": [{ "var": "count" }, 0] }] }, { enabled: true, count: 5 })
 * // Returns: true
 */
export function evaluateRule(rule: JsonLogicExpression, data: any): boolean {
  try {
    const result = jsonLogic.apply(rule, data)
    return Boolean(result)
  } catch (error) {
    console.error('Error evaluating JSON Logic rule:', error, { rule, data })
    return false
  }
}

/**
 * Add custom operations to JSON Logic
 * 
 * @param name - Operation name
 * @param fn - Operation function
 */
export function addOperation(name: string, fn: (...args: any[]) => any): void {
  jsonLogic.add_operation(name, fn)
}

/**
 * Remove custom operation from JSON Logic
 * 
 * @param name - Operation name
 */
export function removeOperation(name: string): void {
  jsonLogic.rm_operation(name)
}
