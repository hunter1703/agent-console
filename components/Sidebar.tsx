"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    History,
    Bot,
    BrainCircuit,
    Sparkles,
    Activity
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { checkHealth } from "@/lib/api";

export default function Sidebar() {
    return (
        <aside className="w-[300px] flex-shrink-0 flex flex-col bg-[var(--sidebar-bg)] border-r border-border p-8 z-20 transition-colors duration-400">
            {/* App Branding - Clean and distinct */}
            <div className="flex items-center gap-4 px-2 mb-14 mt-4">
                <div className="w-12 h-12 rounded-[20px] bg-primary border border-primary-foreground/10 flex items-center justify-center shadow-lg text-primary-foreground">
                    <Sparkles size={22} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[18px] font-bold tracking-tight text-foreground leading-tight">Agent Console</h1>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-bold mt-1">Studio</p>
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1 px-2">
                <NavItem href="/" icon={<LayoutGrid size={18} strokeWidth={2} />} label="Explore" />
                <NavItem href="/history" icon={<History size={18} strokeWidth={2} />} label="History" />

                <div className="mt-10 mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
                    Management
                </div>
                <NavItem href="/admin/agents" icon={<Bot size={18} strokeWidth={2} />} label="Agents" />
                <NavItem href="/admin/models" icon={<BrainCircuit size={18} strokeWidth={2} />} label="Models" />
            </nav>

            <div className="mt-auto px-4 pt-10 pb-4 border-t border-border flex items-center justify-between">
                <StatusIndicator />
                <ThemeToggle />
            </div>
        </aside>
    );
}

function StatusIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        let mounted = true;
        const ping = async () => {
            const up = await checkHealth();
            if (mounted) setIsOnline(up);
        };

        // Initial check
        ping();

        // Poll every 10 seconds
        const interval = setInterval(ping, 10000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="flex items-center gap-3 text-[12px] font-bold tracking-wide">
            {isOnline ? (
                <>
                    <div className="relative flex items-center justify-center w-2.5 h-2.5">
                        <div className="absolute w-full h-full bg-emerald-500 rounded-full opacity-40 animate-[pulse-glow_3s_ease-out_infinite]" />
                        <div className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                    <span className="text-muted-foreground/60">System Online</span>
                </>
            ) : (
                <>
                    <div className="relative flex items-center justify-center w-2.5 h-2.5">
                        <div className="absolute w-full h-full bg-red-500 rounded-full opacity-40 animate-[pulse-glow_3s_ease-out_infinite]" />
                        <div className="relative w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-red-500/80">System Offline</span>
                </>
            )}
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            /* Apply tactile-button for immediate physical feedback on click */
            className={`group flex items-center gap-4 px-4 py-3 rounded-2xl tactile-button ${
                isActive
                    ? "bg-surface shadow-sm border border-border/50 text-foreground"
                    : "border border-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
        >
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-transparent text-muted-foreground group-hover:bg-background group-hover:text-primary group-hover:shadow-sm"
            }`}>
                {icon}
            </div>
            <span className={`text-[14px] font-semibold tracking-tight transition-colors ${isActive ? "" : "group-hover:translate-x-0.5 transition-transform"}`}>{label}</span>
        </Link>
    );
}
