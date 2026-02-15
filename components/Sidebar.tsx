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

export default function Sidebar() {
    return (
        <aside className="w-80 flex-shrink-0 flex flex-col bg-[var(--sidebar-bg)] border-r border-border p-10 z-20 transition-colors duration-300">
            <div className="flex items-center gap-4 px-2 mb-16">
                <div className="w-12 h-12 rounded-[22px] bg-secondary border border-border flex items-center justify-center shadow-xl text-primary">
                    <Sparkles size={24} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[17px] font-semibold tracking-tight text-foreground leading-tight">Agent Console</h1>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold opacity-80 mt-0.5">Studio</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                <NavItem href="/" icon={<LayoutGrid size={20} strokeWidth={1.5} />} label="Explore" />
                <NavItem href="/history" icon={<History size={20} strokeWidth={1.5} />} label="History" />

                <div className="mt-12 mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                    Management
                </div>
                <NavItem href="/admin/agents" icon={<Bot size={20} strokeWidth={1.5} />} label="Agents" />
                <NavItem href="/admin/models" icon={<BrainCircuit size={20} strokeWidth={1.5} />} label="Models" />
            </nav>

            <div className="mt-auto px-4 pt-10 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground/60 text-[13px] font-medium">
                    <Activity size={16} className="text-emerald-500/80" />
                    API Online
                </div>
                <ThemeToggle />
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                ? "bg-secondary text-foreground shadow-sm"
                : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                } `}
        >
            <span className={`transition-all duration-300 ${isActive ? "opacity-100 text-primary scale-110" : "opacity-70 group-hover:opacity-100 group-hover:text-primary/80"
                } `}>{icon}</span>
            <span className="text-[15px] font-medium tracking-tight">{label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.8)]" />
            )}
        </Link>
    );
}
