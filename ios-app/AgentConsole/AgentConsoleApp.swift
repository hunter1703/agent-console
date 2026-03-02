import SwiftUI

@main
struct AgentConsoleApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationView {
                // For demonstration, starting with a hardcoded agent ID
                // In a full app, this would be a selection screen
                ChatView(agentId: "gemini-3-flash")
                    .navigationTitle("Agent Console")
                    .navigationBarTitleDisplayMode(.inline)
            }
        }
    }
}
