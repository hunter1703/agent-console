import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClientProviders } from "./providers";
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased h-screen w-full flex overflow-hidden bg-background text-foreground selection:bg-primary/30 aurora-bg">
        <ClientProviders>
          {/* Minimalist Sidebar extracted to client component */}
          <Sidebar />

          {/* Centered Main Content Area */}
          <main className="flex-1 relative overflow-y-auto bg-transparent selection:bg-primary/20 custom-scrollbar">
            <div className="max-w-[1200px] mx-auto min-h-screen flex flex-col">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
