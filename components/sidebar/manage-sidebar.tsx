import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "../ui/sidebar";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/session";
import { NavUser } from "./nav-user";
import { NavGroup } from "./nav-group";
import { managementMenu } from "./nav-menu";

export function ManageSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <span className="text-2xl font-bold">Phon Dee</span>
            </SidebarHeader>
            <SidebarContent>
                <NavGroup title="จัดการ" items={managementMenu} />
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
