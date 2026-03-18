"use client";

import { ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUI } from "@/lib/stores";

interface MobileNavProps {
    children: ReactNode;
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
}

export default function MobileNav({
    children,
    title = "Navigation",
    showBack = false,
    onBack,
}: MobileNavProps) {
    const { sidebarOpen, setSidebarOpen } = useUI();
    const [scrolled, setScrolled] = useState(false);

    // Detect scroll for header styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* Mobile Header */}
            <header
                className={[
                    "sticky top-0 z-20 md:hidden transition-all",
                    scrolled
                        ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm"
                        : "bg-background border-b border-border",
                ].join(" ")}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={onBack}
                                className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                                aria-label="Go back"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                        )}
                        <h1 className="text-[16px] font-semibold text-foreground truncate">
                            {title}
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg text-foreground hover:bg-surface transition-colors"
                        aria-label="Toggle navigation menu"
                        aria-expanded={sidebarOpen}
                    >
                        {sidebarOpen ? (
                            <X size={20} />
                        ) : (
                            <Menu size={20} />
                        )}
                    </button>
                </div>
            </header>

            {/* Desktop Header (simpler) */}
            <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                <h1 className="text-[18px] font-bold text-foreground tracking-tight">
                    {title}
                </h1>
                {children}
            </header>

            {/* Mobile content */}
            <div className="md:hidden">
                {children}
            </div>
        </>
    );
}
