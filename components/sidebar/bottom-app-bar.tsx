"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { managementMenu, userMenu } from "./nav-menu";

interface BottomAppBarProps {
    variant: "user" | "manage";
}

// Floating bottom app bar for mobile.
export function BottomAppBar({ variant }: BottomAppBarProps) {
    const pathname = usePathname();
    const items = variant === "manage" ? managementMenu : userMenu;

    return (
        <nav
            aria-label="เมนูหลัก"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
        >
            <ul className="pointer-events-auto mx-auto flex h-16 max-w-md items-stretch gap-1 rounded-3xl border border-border/60 bg-background/80 p-1.5 shadow-lg shadow-black/5 ring-1 ring-black/2 backdrop-blur-xl supports-backdrop-filter:bg-background/70 dark:shadow-black/40 dark:ring-white/5">
                {items.map((item) => {
                    const isActive =
                        item.url !== "#" &&
                        (pathname === item.url ||
                            pathname.startsWith(`${item.url}/`));
                    return (
                        <li key={item.title} className="flex-1">
                            <Link
                                href={item.url}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "group flex h-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium text-muted-foreground outline-none transition-colors duration-200 select-none",
                                    "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.97]",
                                    isActive && "text-foreground",
                                )}
                            >
                                {item.icon && (
                                    <span
                                        className={cn(
                                            "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out",
                                            isActive
                                                ? "w-14 bg-primary text-primary-foreground shadow-sm"
                                                : "group-hover:bg-accent",
                                        )}
                                    >
                                        <item.icon
                                            className="size-[18px]"
                                            strokeWidth={isActive ? 2.25 : 2}
                                        />
                                    </span>
                                )}
                                <span
                                    className={cn(
                                        "max-w-full truncate px-1 leading-tight",
                                        isActive && "font-semibold",
                                    )}
                                >
                                    {item.title}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
