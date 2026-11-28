import { Suspense } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { getSessionUser } from "@/lib/session";
import { NavGroup, type NavItem } from "./nav-group";
import { NavUser } from "./nav-user";

// Sidebar for the app, with a header, a nav group, and a footer showing the current user. The nav group is collapsible on small screens.
export function AppSidebar({
    label,
    items,
}: {
    label: string;
    items: NavItem[];
}) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <span className="text-2xl font-bold">Phon Dee</span>
            </SidebarHeader>
            <SidebarContent>
                <NavGroup title={label} items={items} />
            </SidebarContent>
            <SidebarFooter>
                <Suspense fallback={<NavUser user={null} />}>
                    <CurrentNavUser />
                </Suspense>
            </SidebarFooter>
        </Sidebar>
    );
}

async function CurrentNavUser() {
    return <NavUser user={await getSessionUser()} />;
}
