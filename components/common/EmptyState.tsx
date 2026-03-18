"use client";

import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={[
                "flex flex-col items-center justify-center py-16 text-center",
                className,
            ].join(" ")}
        >
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                {icon || <Inbox size={24} className="text-muted-foreground" />}
            </div>
            <h3 className="text-[16px] font-semibold text-foreground">
                {title}
            </h3>
            {description && (
                <p className="mt-1 text-[14px] text-muted-foreground max-w-sm">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="primary"
                    size="sm"
                    className="mt-4"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
