"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";

/**
 * Renders the NavBar on all pages except the Studio (/chat/*).
 * The Studio has its own full-screen header.
 */
export default function NavBarWrapper() {
    const pathname = usePathname();

    // Studio pages manage their own header
    if (pathname.startsWith("/chat/")) return null;

    return <NavBar />;
}
