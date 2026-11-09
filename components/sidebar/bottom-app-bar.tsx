"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { managementMenu, userMenu } from "./nav-menu";

interface BottomAppBarProps {
    variant: "user" | "manage";
}

export function BottomAppBar({ variant }: BottomAppBarProps) {
    const pathname = usePathname();
    const items = variant === "manage" ? managementMenu : userMenu;

    return (
        <nav
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
            <ul className="flex h-16 items-stretch">
                {items.map((item) => {
                    const isActive = item.url !== "#" && pathname.startsWith(item.url);
                    return (
                        <li key={item.title} className="flex-1">
                            <a
                                href={item.url}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:bg-accent",
                                    isActive && "text-foreground",
                                )}
                            >
                                {item.icon && (
                                    <span
                                        className={cn(
                                            "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                                            isActive && "bg-accent",
                                        )}
                                    >
                                        <item.icon className="size-5" />
                                    </span>
                                )}
                                <span className="max-w-full truncate px-1">{item.title}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
