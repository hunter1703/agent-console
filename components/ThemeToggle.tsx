"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
    variant?: "button" | "inline";
}

export default function ThemeToggle({ variant = "inline" }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-8 h-8" />;
    }

    const themes: Array<{ value: string; label: string; icon: React.ReactNode }> = [
        { value: "light", label: "Light", icon: <Sun size={14} /> },
        { value: "dark", label: "Dark", icon: <Moon size={14} /> },
        { value: "system", label: "System", icon: <Monitor size={14} /> },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[0];

    if (variant === "button") {
        return (
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                title="Toggle Theme"
            >
                {theme === "dark" ? (
                    <Moon size={18} className="text-foreground" />
                ) : (
                    <Sun size={18} className="text-foreground" />
                )}
            </button>
        );
    }

    // Inline variant for sidebar
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors text-[13px] text-foreground"
            >
                {currentTheme.icon}
                <span className="capitalize">{currentTheme.label}</span>
                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-32 rounded-lg bg-background border border-border shadow-lg z-20 overflow-hidden">
                        {themes.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => {
                                    setTheme(t.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors ${
                                    theme === t.value
                                        ? "bg-primary/10 text-primary"
                                        : "text-foreground hover:bg-surface"
                                }`}
                            >
                                {t.icon}
                                <span className="capitalize">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
