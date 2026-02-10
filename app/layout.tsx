import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Console",
  description: "Advanced interaction and debugging for AI Agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased h-screen w-full flex overflow-hidden bg-background text-foreground selection:bg-primary/30">

        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 flex flex-col glass border-r border-white/5 p-6 z-20">
          <div className="flex items-center gap-3 px-2 mb-10 text-foreground">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-lg">🤖</span>
            </div>
            <h1 className="text-sm font-bold tracking-wide">Agent Console</h1>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <span className="opacity-70">◆</span>
              Dashboard
            </a>
            <a href="/history" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <span className="opacity-70">🕒</span>
              History
            </a>
            <a href="/admin/agents" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <span className="opacity-70">⚙</span>
              Settings
            </a>
          </nav>

          <div className="mt-auto px-4 py-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600"></div>
              <div>
                <p className="text-xs font-medium">Developer</p>
                <p className="text-[10px] text-muted-foreground">Admin Access</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col overflow-hidden bg-gradient-to-b from-background to-[#050505]">
          {children}
        </main>

      </body>
    </html>
  );
}
