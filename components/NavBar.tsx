"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { checkHealth } from "@/lib/api";

const navItems = [
    { href: "/", label: "Home", exact: true },
    { href: "/history", label: "History", exact: false },
    { href: "/settings", label: "Settings", exact: false },
] as const;

export default function NavBar() {
    const pathname = usePathname();
    const [isOffline, setIsOffline] = useState(false);

    // Only show offline banner — no performative "System Online" pulse
    useEffect(() => {
        let mounted = true;

        const ping = async () => {
            const up = await checkHealth();
            if (mounted) setIsOffline(!up);
        };

        ping();
        const id = setInterval(ping, 15_000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    return (
        <div className="shrink-0">
            <header className="h-12 flex items-center gap-1 px-4 border-b border-[var(--border)] bg-[var(--background)]">
                {navItems.map(({ href, label, exact }) => {
                    const isActive = exact
                        ? pathname === href
                        : pathname === href || pathname.startsWith(href + "/");

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={[
                                "relative flex items-center h-12 px-3 text-[14px] font-medium transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                                isActive
                                    ? "text-[var(--foreground)]"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                            ].join(" ")}
                        >
                            {label}
                            {/* Active indicator — bottom border, Apple tab style */}
                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-[var(--primary)]"
                                    aria-hidden="true"
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="ml-auto flex items-center">
                    <ThemeToggle />
                </div>
            </header>

            {/* Connectivity error — shown only when offline. Silence is the default. */}
            {isOffline && (
                <div className="bg-[var(--amber)] bg-opacity-10 border-b border-[var(--amber)] border-opacity-20 px-4 py-1.5 flex items-center gap-2 text-[13px] text-[var(--amber)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] shrink-0" />
                    Backend unreachable · Retrying...
                </div>
            )}
        </div>
    );
}
