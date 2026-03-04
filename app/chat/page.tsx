"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getResourceById } from "@/lib/api";

function ChatResolver() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            router.replace("/");
            return;
        }

        getResourceById("session", sessionId)
            .then((session: any) => {
                const agentId = session.agentId || session.agent_id;
                if (agentId) {
                    router.replace(`/chat/${agentId}?sessionId=${sessionId}`);
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true));
    }, [sessionId, router]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-full">
                <p className="text-[14px] text-muted">Could not resolve session.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="flex items-center gap-2 text-[14px] text-muted">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                Loading session…
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-full">
                    <span className="text-[14px] text-muted">Loading…</span>
                </div>
            }
        >
            <ChatResolver />
        </Suspense>
    );
}
