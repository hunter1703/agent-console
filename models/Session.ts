import type { Message } from "@/types/message";

export interface ChatSession {
    id: string;
    agentId: string;
    title: string;
    createdAt: number;
    lastActiveAt: number;
    messages: Message[];
    threadId?: string;
}
