import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { userMenu } from "@/components/sidebar/nav-menu";
import { BottomAppBar } from "@/components/sidebar/bottom-app-bar";
import { SiteHeader } from "@/components/site-header/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
    return (
        <SidebarProvider>
            <AppSidebar label="เมนูหลัก" items={userMenu} />
            <SiteHeader />
            <main className="min-w-0 flex-1 pt-12 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
                {children}
            </main>
            <BottomAppBar variant="user" />
        </SidebarProvider>
    );
}
