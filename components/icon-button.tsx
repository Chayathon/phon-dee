"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "size"> & {
    label: string;
};

export function IconButton({
    label,
    variant = "ghost",
    children,
    ...props
}: IconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant={variant}
                        size="icon"
                        aria-label={label}
                        {...props}
                    />
                }
            >
                {children}
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
