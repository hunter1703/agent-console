"use client";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "primary" | "success" | "warning" | "error" | "neutral";
    size?: "sm" | "md";
    className?: string;
}

export default function Badge({
    children,
    variant = "default",
    size = "md",
    className = "",
}: BadgeProps) {
    const variantClasses = {
        default: "bg-surface text-foreground border-border",
        primary: "bg-primary/10 text-primary border-primary/20",
        success: "bg-green/10 text-green border-green/20",
        warning: "bg-amber/10 text-amber border-amber/20",
        error: "bg-red/10 text-red border-red/20",
        neutral: "bg-surface text-muted-foreground border-border",
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-[11px]",
    };

    return (
        <span
            className={[
                "inline-flex items-center font-medium rounded-full border",
                variantClasses[variant],
                sizeClasses[size],
                className,
            ].join(" ")}
        >
            {children}
        </span>
    );
}
