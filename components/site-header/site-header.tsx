import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogoutButton } from "./logout-button";

export function SiteHeader() {
    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex h-12 items-center gap-2 border-b bg-background/80 px-2 backdrop-blur transition-[left] duration-200 ease-linear md:left-(--sidebar-width) peer-data-[state=collapsed]:md:left-(--sidebar-width-icon)">
            <SidebarTrigger />
            <div className="ml-auto">
                <LogoutButton />
            </div>
        </header>
    );
}
