import Foundation
import Observation

@Observable
class AgentViewModel {
    var agent: AgentConfig?
    var messages: [Message] = []
    var isStreaming: Bool = false
    var sessionId: String?
    
    struct Message: Identifiable {
        let id: String
        let role: String
        var content: String
        var kind: MessageKind = .text
        var thoughts: [String] = []
        var isStreaming: Bool = false
    }
    
    enum MessageKind {
        case text, thought, planning
    }
    
    func loadAgent(id: String) async {
        do {
            agent = try await AgentClient.shared.fetchAgentConfig(id: id)
        } catch {
            print("Failed to load agent: \(error)")
        }
    }
    
    func sendMessage(_ text: String, agentId: String) async {
        guard !text.isEmpty && !isStreaming else { return }
        
        isStreaming = true
        let userMsg = Message(id: UUID().uuidString, role: "user", content: text)
        messages.append(userMsg)
        
        let request = AgentRequest(type: "agent", agentId: agentId, sessionId: sessionId, message: text)
        
        do {
            let stream = try await AgentClient.shared.streamEvents(request: request)
            for try await rawEvent in stream {
                handleEvent(rawEvent)
            }
        } catch {
            print("Stream error: \(error)")
        }
        
        isStreaming = false
    }
    
    private func handleEvent(_ raw: AguiRawEvent) {
        let events = translate(raw: raw)
        for event in events {
            processEvent(event)
        }
    }
    
    private func translate(raw: AguiRawEvent) -> [AgentEvent] {
        // Mapping logic mirroring aguiAdapter.ts
        switch raw.type {
        case "RUN_STARTED":
            return [.runStarted(runId: raw.run_id ?? "unknown", threadId: raw.thread_id)]
        case "TEXT_MESSAGE_CHUNK":
            return [.assistantTextDelta(content: raw.delta ?? "", messageId: raw.message_id)]
        case "STEP_STARTED", "THINKING_START":
            return [.thinkingStart(stepName: raw.step_name ?? "Thought")]
        case "THINKING_TEXT_MESSAGE_CONTENT":
            return [.thinkingUpdate(content: raw.delta ?? "")]
        case "STEP_FINISHED", "THINKING_END":
            return [.thinkingEnd]
        default:
            return []
        }
    }
    
    private func processEvent(_ event: AgentEvent) {
        switch event {
        case .assistantTextDelta(let content, let messageId):
            updateAssistantMessage(content: content, id: messageId)
        case .thinkingStart(let stepName):
            startThinking(stepName: stepName)
        case .thinkingUpdate(let content):
            updateThinking(content: content)
        case .thinkingEnd:
            endThinking()
        case .runStarted(_, let threadId):
            if sessionId == nil { self.sessionId = threadId }
        default:
            break
        }
    }
    
    private func updateAssistantMessage(content: String, id: String?) {
        let mid = id ?? "legacy"
        if let index = messages.firstIndex(where: { $0.id == mid }) {
            messages[index].content += content
        } else {
            let newMsg = Message(id: mid, role: "assistant", content: content)
            messages.append(newMsg)
        }
    }
    
    private func startThinking(stepName: String) {
        if let last = messages.last, last.kind == .thought {
            var updated = last
            updated.thoughts.append("")
            updated.isStreaming = true
            messages[messages.count - 1] = updated
        } else {
            let thoughtMsg = Message(id: UUID().uuidString, role: "assistant", content: "", kind: .thought, thoughts: [""], isStreaming: true)
            messages.append(thoughtMsg)
        }
    }
    
    private func updateThinking(content: String) {
        guard var last = messages.last, last.kind == .thought else { return }
        if var lastThought = last.thoughts.last {
            last.thoughts[last.thoughts.count - 1] = lastThought + content
            messages[messages.count - 1] = last
        }
    }
    
    private func endThinking() {
        guard var last = messages.last, last.kind == .thought else { return }
        last.isStreaming = false
        messages[messages.count - 1] = last
    }
}
