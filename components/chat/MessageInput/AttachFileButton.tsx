"use client";

import { Paperclip } from "lucide-react";

interface AttachFileButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function AttachFileButton({ onClick, disabled = false }: AttachFileButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors mb-0.5",
                disabled
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-primary",
            ].join(" ")}
            title="Attach file"
            aria-label="Attach file"
        >
            <Paperclip size={15} strokeWidth={2} />
        </button>
    );
}
