"use client";

import React, { createContext, useCallback, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [activeDialog, setActiveDialog] = useState<ConfirmOptions | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setActiveDialog(options);
        });
    }, []);

    const handleClose = (result: boolean) => {
        resolveRef.current?.(result);
        setActiveDialog(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {activeDialog && (
                <ConfirmDialogModal
                    {...activeDialog}
                    onConfirm={() => handleClose(true)}
                    onCancel={() => handleClose(false)}
                />
            )}
        </ConfirmContext.Provider>
    );
}

function ConfirmDialogModal({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    onConfirm,
    onCancel,
}: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Focus the cancel button on mount & handle ESC
    useEffect(() => {
        cancelRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] animate-in fade-in duration-200"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
        >
            <div
                className="bg-background border border-border rounded-[28px] p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-5">
                    {destructive && (
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle size={24} strokeWidth={1.5} className="text-red-400" />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <h3 id="confirm-title" className="text-[18px] font-semibold text-foreground tracking-tight">
                            {title}
                        </h3>
                        <p id="confirm-message" className="text-[14px] text-muted-foreground leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full mt-2">
                        <button
                            ref={cancelRef}
                            onClick={onCancel}
                            className="flex-1 h-12 rounded-2xl text-[15px] font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all active:scale-[0.98]"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 h-12 rounded-2xl text-[15px] font-semibold text-white transition-all active:scale-[0.98] shadow-lg ${
                                destructive
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                            }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
