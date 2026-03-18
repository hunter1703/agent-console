"use client";

import { ArrowUp } from "lucide-react";

interface SendButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function SendButton({ onClick, disabled = false }: SendButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors mb-0.5",
                disabled
                    ? "bg-surface-active text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary-hover",
            ].join(" ")}
            title="Send"
            aria-label="Send message"
        >
            <ArrowUp size={15} strokeWidth={2.5} />
        </button>
    );
}
