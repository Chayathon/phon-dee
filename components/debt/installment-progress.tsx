import type { ReactNode } from "react";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const VARIANTS = {
    /** On a regular card. */
    default: {
        root: "gap-2 *:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-indicator]:rounded-full",
        label: "text-xs font-normal text-muted-foreground tabular-nums",
        value: "text-xs",
    },
    /** On the primary-coloured balance hero. */
    onPrimary: {
        root: "relative gap-2 *:data-[slot=progress-track]:h-2 *:data-[slot=progress-track]:bg-primary-foreground/15 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-primary-foreground **:data-[slot=progress-indicator]:data-complete:bg-emerald-400",
        label: "text-sm font-normal tabular-nums opacity-70",
        value: "text-sm text-primary-foreground opacity-70",
    },
};

export function InstallmentProgress({
    value,
    label,
    variant = "default",
    className,
}: {
    value: number;
    label: ReactNode;
    variant?: keyof typeof VARIANTS;
    className?: string;
}) {
    const v = VARIANTS[variant];
    return (
        <Progress value={value} className={cn(v.root, className)}>
            <ProgressLabel className={v.label}>{label}</ProgressLabel>
            <ProgressValue className={v.value} />
        </Progress>
    );
}
