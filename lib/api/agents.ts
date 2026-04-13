/**
 * Agent API Functions
 * 
 * Re-exports agent-related functions from services for backward compatibility.
 */

export {
  listAgents,
  searchAgents,
  getAgent,
  createAgent,
  updateAgent,
  upsertAgent,
  deleteAgent,
  type Agent
} from './services'