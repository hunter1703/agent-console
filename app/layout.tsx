import type { Metadata, Viewport } from "next";
import { ClientProviders } from "./providers";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
    title: "Agent Console",
    description: "A modern workspace for AI agent interaction",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
        { media: "(prefers-color-scheme: dark)", color: "#111111" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="h-dvh w-full overflow-hidden antialiased bg-background text-foreground selection:bg-primary/20">
                <ClientProviders>
                    <div className="flex h-dvh w-full">
                        {/* Desktop Sidebar */}
                        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface/30 backdrop-blur">
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-foreground tracking-tight">Agent Console</span>
                            </div>
                            
                            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                                <a
                                    href="/"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-surface transition-colors group"
                                >
                                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="text-[14px] font-medium">Home</span>
                                </a>
                                
                                <a
                                    href="/history"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-surface transition-colors group"
                                >
                                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-[14px] font-medium">History</span>
                                </a>
                                
                                <a
                                    href="/settings"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-surface transition-colors group"
                                >
                                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-[14px] font-medium">Settings</span>
                                </a>
                            </nav>
                            
                            {/* User section */}
                            <div className="p-4 border-t border-border space-y-3">
                                {/* Theme Toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                                
                                {/* User info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-[12px] font-semibold text-primary">U</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-foreground truncate">User</p>
                                        <p className="text-[11px] text-muted-foreground truncate">user@example.com</p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 min-h-0 overflow-y-auto">
                            {/* Mobile Header */}
                            <header className="md:hidden sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-foreground">Agent Console</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ThemeToggle variant="button" />
                                        <button
                                            className="p-2 rounded-lg hover:bg-surface transition-colors"
                                            aria-label="Open menu"
                                        >
                                            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </header>
                            
                            <div className="min-h-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </ClientProviders>
            </body>
        </html>
    );
}
