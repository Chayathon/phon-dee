import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DetailItem = { label: string; value: string; icon: LucideIcon };

export function DetailGrid({
    items,
    className,
}: {
    items: DetailItem[];
    className?: string;
}) {
    return (
        <dl
            className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-2xl border p-4",
                className,
            )}
        >
            {items.map((d) => (
                <div
                    key={d.label}
                    className="flex min-w-0 items-center gap-2.5"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <d.icon className="size-4" />
                    </span>
                    <div className="grid min-w-0 gap-0.5">
                        <dt className="text-xs text-muted-foreground">
                            {d.label}
                        </dt>
                        <dd className="truncate text-sm font-semibold tabular-nums">
                            {d.value}
                        </dd>
                    </div>
                </div>
            ))}
        </dl>
    );
}
