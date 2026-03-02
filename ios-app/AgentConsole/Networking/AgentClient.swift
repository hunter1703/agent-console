import Foundation

class AgentClient {
    static let shared = AgentClient()
    private let baseURL = URL(string: "https://api.example.com")! // Replace with actual API base
    
    func streamEvents(request: AgentRequest) async throws -> AsyncThrowingStream<AguiRawEvent, Error> {
        var urlRequest = URLRequest(url: baseURL.appendingPathComponent("v1/agent/events"))
        urlRequest.httpMethod = "POST"
        urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.addValue("text/event-stream", forHTTPHeaderField: "Accept")
        urlRequest.httpBody = try JSONEncoder().encode(request)
        
        return AsyncThrowingStream { continuation in
            Task {
                do {
                    let (bytes, response) = try await URLSession.shared.bytes(for: urlRequest)
                    guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                        continuation.finish(throwing: URLError(.badServerResponse))
                        return
                    }
                    
                    for try await line in bytes.lines {
                        if line.hasPrefix("data: ") {
                            let dataStr = String(line.dropFirst(6))
                            if dataStr.trimmingCharacters(in: .whitespaces) == "[DONE]" {
                                continuation.finish()
                                return
                            }
                            
                            if let data = dataStr.data(using: .utf8) {
                                let event = try JSONDecoder().decode(AguiRawEvent.self, from: data)
                                continuation.yield(event)
                            }
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }
    
    func fetchAgentConfig(id: String) async throws -> AgentConfig {
        let url = baseURL.appendingPathComponent("v1/catalog/agent/\(id)")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(AgentConfig.self, from: data)
    }
}
