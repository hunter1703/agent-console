"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export default function PageHeader({
    title,
    description,
    actions,
    className = "",
}: PageHeaderProps) {
    return (
        <div
            className={[
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
                className,
            ].join(" ")}
        >
            <div>
                <h1 className="text-[24px] font-bold text-foreground tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-[14px] text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
