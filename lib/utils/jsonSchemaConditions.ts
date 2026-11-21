/**
 * JSON Schema conditions
 *
 * Which properties of an object schema apply to some data, as its `if`/`then`/`else` conditions
 * decide, in `allOf` or on the schema itself.
 */

import Ajv from 'ajv'

type JsonSchema = Record<string, any>

export interface ConditionalFields {
  /** Properties that only some data has, whether or not they apply to the data given */
  conditional: Set<string>
  /** The conditional properties that apply to the data given */
  applicable: Set<string>
  /** The properties that are required, by the schema and by the conditions that apply */
  required: Set<string>
}

const ajv = new Ajv({ strict: false })

export function resolveConditionalFields(schema: JsonSchema, data: unknown): ConditionalFields {
  const fields: ConditionalFields = {
    conditional: new Set(),
    applicable: new Set(),
    required: new Set(schema.required || []),
  }
  for (const node of [schema, ...(schema.allOf || [])]) {
    if (!node.if) continue
    const matches = ajv.compile(node.if)(data) as boolean
    for (const branch of [node.then, node.else]) {
      Object.keys(branch?.properties || {}).forEach(name => fields.conditional.add(name))
    }
    const applying = matches ? node.then : node.else
    Object.keys(applying?.properties || {}).forEach(name => fields.applicable.add(name))
    ;(applying?.required || []).forEach((name: string) => fields.required.add(name))
  }
  return fields
}
