import Foundation

struct AgentConfig: Codable, Identifiable {
    let id: String?
    let type: String?
    let name: String?
    let description: String?
    let avatar: String?
    let model: AgentModelConfig?
}

struct AgentModelConfig: Codable {
    let modelId: String?
    let role: String?
    let systemPrompt: String?
    let type: String?
}

struct AgentRequest: Codable {
    let type: String?
    let agentId: String?
    let sessionId: String?
    let message: String?
}

struct AguiRawEvent: Codable {
    let type: String
    let thread_id: String?
    let run_id: String?
    let message_id: String?
    let delta: String?
    let content: String?
    let role: String?
    let step_name: String?
    let tool_call_id: String?
    let tool_call_name: String?
    let error: String?
    let messageText: String? // Mapped from 'message' to avoid Swift warning
    let timestamp: Double?
    let created_at: Double?
    let name: String?
    let value: String?
    
    enum CodingKeys: String, CodingKey {
        case type, thread_id, run_id, message_id, delta, content, role, step_name
        case tool_call_id, tool_call_name, error, timestamp, created_at, name, value
        case messageText = "message"
    }
}

enum AgentEvent {
    case runStarted(runId: String, threadId: String?)
    case assistantTextDelta(content: String, messageId: String?)
    case assistantTextSync(content: String, messageId: String?)
    case thinkingStart(stepName: String)
    case thinkingUpdate(content: String)
    case thinkingEnd
    case toolCallStarted(name: String, id: String, args: String)
    case toolArgsUpdate(id: String, delta: String)
    case toolResult(name: String, id: String, content: String)
    case error(message: String)
    case streamEnd
}
