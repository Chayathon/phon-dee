import { ManageSidebar } from "@/components/sidebar/manage-sidebar";
import { BottomAppBar } from "@/components/sidebar/bottom-app-bar";
import { SiteHeader } from "@/components/site-header/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ManageLayout({ children }: LayoutProps<"/manage">) {
    return (
        <SidebarProvider>
            <ManageSidebar />
            <SiteHeader />
            <main className="min-w-0 flex-1 pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
                {children}
            </main>
            <BottomAppBar variant="manage" />
        </SidebarProvider>
    );
}
