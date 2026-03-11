"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toast: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
    };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context.toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const success = useCallback((message: string) => {
        addToast("success", message);
    }, [addToast]);

    const error = useCallback((message: string) => {
        addToast("error", message);
    }, [addToast]);

    const info = useCallback((message: string) => {
        addToast("info", message);
    }, [addToast]);

    const toast = useMemo(() => ({ success, error, info }), [success, error, info]);
    const contextValue = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const iconMap = {
    success: <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />,
    error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
    info: <Info size={18} className="text-primary flex-shrink-0" />,
};

const bgMap = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-primary/10 border-primary/20",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-2xl shadow-2xl min-w-[320px] max-w-[480px] animate-in slide-in-from-right-5 fade-in duration-300 ${bgMap[toast.type]}`}
            role="alert"
        >
            {iconMap[toast.type]}
            <p className="text-[14px] text-foreground font-medium flex-1 leading-snug">
                {toast.message}
            </p>
            <button
                onClick={onDismiss}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-all flex-shrink-0"
                aria-label="Dismiss notification"
            >
                <X size={14} />
            </button>
        </div>
    );
}
