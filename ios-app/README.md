# Agent Console iOS App

This folder contains the native iOS implementation of the Agent Console, built with SwiftUI and Swift Concurrency.

## Project Structure

- **AgentConsoleApp.swift**: The app entry point.
- **Models/ApiSchemas.swift**: Swift `Codable` models mirroring the backend's OpenAPI schema.
- **Networking/AgentClient.swift**: Centralized networking service handling REST calls and SSE streaming via `URLSession.bytes`.
- **ViewModels/AgentViewModel.swift**: Reactive state management using the `@Observable` macro (iOS 17+).
- **Views/ChatView.swift**: The main chat interface, including:
    - `MessageBubble`: Handles user and assistant messages.
    - `ThoughtView`: Renders collapsible/indented thought sections.
    - `ThoughtPulse`: A custom SwiftUI animation for the "thinking" state.

## How to Run

1. Open **Xcode 15+**.
2. Create a new **SwiftUI Project** named `AgentConsole`.
3. Copy the contents of this folder into your Xcode project.
4. Ensure your actual backend API URL is set in `Networking/AgentClient.swift`.
5. Run on a simulator or device (iOS 17+ recommended).

## Features Implemented

- **SSE Streaming**: Real-time event consumption from the backend.
- **Thought Grouping**: Logical separation of multiple thinking steps within a single message block.
- **Premium UI**: "Apple-like" visuals with ultra-thin materials, smooth animations, and pulsing indicators.
- **Auto-scroll**: The chat window automatically stays at the latest message during streaming.
