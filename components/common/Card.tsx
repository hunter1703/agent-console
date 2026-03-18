"use client";

import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({
    children,
    className = "",
    padding = "md",
    hover = false,
    onClick,
}: CardProps) {
    const paddingClasses = {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    return (
        <div
            className={[
                "rounded-xl bg-surface border border-border",
                "transition-all duration-200",
                paddingClasses[padding],
                hover ? "hover-lift cursor-pointer" : "",
                className,
            ].join(" ")}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
