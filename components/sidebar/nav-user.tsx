"use client";

import type { SessionUser } from "@/app/actions/auth";
import { UserAvatar } from "@/components/user-avatar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    USER: "ผู้ใช้งาน",
};

export function NavUser({ user }: { user: SessionUser | null }) {
    const name = user?.name ?? "Guest";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                    <UserAvatar
                        name={name}
                        picture={user?.picture ?? null}
                        initials={2}
                        className="size-8 rounded-lg after:rounded-lg"
                        fallbackClassName="rounded-lg font-normal"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{name}</span>
                        <span className="truncate text-xs">
                            {user ? (ROLE_LABELS[user.role] ?? user.role) : ""}
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
