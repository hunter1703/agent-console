import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Console",
  description: "Advanced interaction and debugging for AI Agents",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased h-screen w-full flex overflow-hidden bg-background text-foreground selection:bg-primary/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Minimalist Sidebar extracted to client component */}
          <Sidebar />

          {/* Centered Main Content Area */}
          <main className="flex-1 relative overflow-y-auto bg-background selection:bg-primary/20 custom-scrollbar">
            <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
