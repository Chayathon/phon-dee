"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Fab({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Button
            size="icon-lg"
            aria-label={label}
            className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg lg:right-6 lg:bottom-6"
            onClick={onClick}
        >
            {children}
        </Button>
    );
}
