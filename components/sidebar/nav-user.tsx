"use client";

import type { SessionUser } from "@/app/actions/auth";
import { getSessionUser } from "@/lib/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser({ user }: { user: SessionUser | null }) {
    const name = user?.name ?? "Guest";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <Avatar className="h-8 w-8 rounded-lg">
                        {user?.picture && (
                            <AvatarImage src={user.picture} alt={name} />
                        )}
                        <AvatarFallback className="rounded-lg">
                            {name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{name}</span>
                        <span className="truncate text-xs">
                            {user?.role ?? ""}
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
