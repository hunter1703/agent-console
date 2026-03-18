"use client";

interface SkeletonProps {
    variant?: "text" | "circular" | "rectangular" | "rounded";
    width?: string | number;
    height?: string | number;
    className?: string;
}

export default function Skeleton({
    variant = "text",
    width,
    height,
    className = "",
}: SkeletonProps) {
    const variantClasses = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-sm",
        rounded: "rounded-lg",
    };

    const style: React.CSSProperties = {};
    if (width !== undefined) {
        style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
        style.height = typeof height === "number" ? `${height}px` : height;
    }

    return (
        <div
            className={[
                "bg-surface animate-skeleton",
                variantClasses[variant],
                className,
            ].join(" ")}
            style={style}
            aria-hidden="true"
        />
    );
}
