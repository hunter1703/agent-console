import type { Metadata, Viewport } from "next";
import { ClientProviders } from "./providers";
import NavBarWrapper from "@/components/NavBarWrapper";
import "./globals.css";

export const metadata: Metadata = {
    title: "Agent Console",
    description: "A workspace for AI agent interaction and reasoning",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="h-dvh w-full flex flex-col overflow-hidden antialiased bg-background text-foreground selection:bg-primary/20">
                <ClientProviders>
                    <NavBarWrapper />
                    <main className="flex-1 min-h-0 overflow-y-auto">
                        {children}
                    </main>
                </ClientProviders>
            </body>
        </html>
    );
}
