import { Message } from "@/components/ChatWindow";

export interface ChatSession {
    id: string;
    agentId: string;
    title: string;
    createdAt: number;
    lastActiveAt: number;
    messages: Message[];
}
