"use client";

import { Square } from "lucide-react";

interface StopButtonProps {
    onClick: () => void;
}

export default function StopButton({ onClick }: StopButtonProps) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-foreground/10 hover:bg-foreground/20 text-foreground mb-0.5"
            title="Stop"
            aria-label="Stop generating"
        >
            <Square size={12} fill="currentColor" strokeWidth={0} />
        </button>
    );
}
