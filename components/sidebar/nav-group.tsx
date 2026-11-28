import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";

export type NavItem = {
    title: string;
    url: string;
    icon?: LucideIcon;
};

interface NavGroupProps {
    title: string;
    items: NavItem[];
}

export function NavGroup({ title, items }: NavGroupProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            render={<Link href={item.url} />}
                            tooltip={item.title}
                        >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
