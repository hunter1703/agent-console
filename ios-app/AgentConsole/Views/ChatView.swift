import SwiftUI

struct ChatView: View {
    @State private var viewModel = AgentViewModel()
    @State private var inputText = ""
    let agentId: String
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(viewModel.agent?.name ?? "Agent")
                    .font(.headline)
                Spacer()
                if viewModel.isStreaming {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
            .padding()
            .background(.ultraThinMaterial)
            
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 16) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) {
                    if let last = viewModel.messages.last {
                        withAnimation {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            // Input
            HStack(spacing: 12) {
                TextField("Message \(viewModel.agent?.name ?? "Agent")...", text: $inputText)
                    .padding(12)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(20)
                
                Button {
                    let text = inputText
                    inputText = ""
                    Task {
                        await viewModel.sendMessage(text, agentId: agentId)
                    }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(inputText.isEmpty ? .gray : .blue)
                }
                .disabled(inputText.isEmpty || viewModel.isStreaming)
            }
            .padding()
            .background(.ultraThinMaterial)
        }
        .task {
            await viewModel.loadAgent(id: agentId)
        }
    }
}

struct MessageBubble: View {
    let message: AgentViewModel.Message
    
    var body: some View {
        HStack(alignment: .top) {
            if message.role == "user" {
                Spacer()
                Text(message.content)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(20)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    if message.kind == .thought {
                        ThoughtView(thoughts: message.thoughts, isStreaming: message.isStreaming)
                    } else {
                        Text(message.content)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(Color(.secondarySystemBackground))
                            .cornerRadius(20)
                    }
                }
                Spacer()
            }
        }
    }
}

struct ThoughtView: View {
    let thoughts: [String]
    let isStreaming: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(0..<thoughts.count, id: \.self) { index in
                HStack(alignment: .top, spacing: 12) {
                    if isStreaming && index == thoughts.count - 1 {
                        ThoughtPulse()
                            .frame(width: 8, height: 8)
                            .padding(.top, 6)
                    } else {
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                            .padding(.top, 6)
                    }
                    
                    Text(thoughts[index])
                        .font(.system(.body, design: .serif))
                        .foregroundColor(.secondary)
                        .italic()
                }
            }
        }
        .padding(.leading, 8)
        .padding(.vertical, 8)
    }
}

struct ThoughtPulse: View {
    @State private var isPulsing = false
    
    var body: some View {
        Circle()
            .fill(Color.blue)
            .scaleEffect(isPulsing ? 1.5 : 1.0)
            .opacity(isPulsing ? 0.2 : 0.8)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                    isPulsing.toggle()
                }
            }
    }
}

#Preview {
    ChatView(agentId: "test-agent")
}
