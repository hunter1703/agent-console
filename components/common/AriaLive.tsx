"use client";

import { useEffect, useState } from "react";

interface AriaLiveProps {
    message: string;
    politeness?: "polite" | "assertive";
    clearDelay?: number;
}

/**
 * ARIA Live Region for screen reader announcements
 * Use this to announce dynamic content changes to screen reader users
 */
export default function AriaLive({
    message,
    politeness = "polite",
    clearDelay = 1000,
}: AriaLiveProps) {
    const [announcement, setAnnouncement] = useState("");

    useEffect(() => {
        if (message) {
            setAnnouncement(message);
            const timer = setTimeout(() => {
                setAnnouncement("");
            }, clearDelay);
            return () => clearTimeout(timer);
        }
    }, [message, clearDelay]);

    if (!announcement) return null;

    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {announcement}
        </div>
    );
}

/**
 * ARIA Live Region for assertive announcements (interrupts)
 */
export function AriaLiveAssertive({ message }: { message: string }) {
    return <AriaLive message={message} politeness="assertive" />;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAriaAnnounce() {
    const [message, setMessage] = useState("");

    const announce = (msg: string, assertive = false) => {
        setMessage("");
        // Force re-render for same message
        requestAnimationFrame(() => {
            setMessage(msg);
        });
    };

    return { message, announce, AssertiveComponent: () => <AriaLiveAssertive message={message} /> };
}
