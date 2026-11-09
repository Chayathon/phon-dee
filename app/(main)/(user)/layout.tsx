import { UserSidebar } from "@/components/sidebar/user-sidebar";
import { BottomAppBar } from "@/components/sidebar/bottom-app-bar";
import { SiteHeader } from "@/components/site-header/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <UserSidebar />
            <SiteHeader />
            <main className="min-w-0 flex-1 pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
                {children}
            </main>
            <BottomAppBar variant="user" />
        </SidebarProvider>
    );
}
