import type { ReactNode } from "react";
import { InstallmentProgress } from "@/components/debt/installment-progress";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
    md: {
        root: "gap-5 p-5",
        ring: "-top-14 -right-14 size-44 border-22",
        text: "gap-0.5",
        amount: "text-4xl",
    },
    lg: {
        root: "justify-between gap-6 p-6",
        ring: "-top-16 -right-16 size-56 border-28",
        text: "gap-1",
        amount: "text-4xl sm:text-5xl",
    },
};

type BalanceHeroProps = {
    eyebrow?: ReactNode;
    label: ReactNode;
    amount: number;
    caption?: ReactNode;
    progress?: { value: number; label: ReactNode };
    size?: keyof typeof SIZES;
    className?: string;
};

export function BalanceHero({
    eyebrow,
    label,
    amount,
    caption,
    progress,
    size = "md",
    className,
}: BalanceHeroProps) {
    const s = SIZES[size];
    return (
        <section
            className={cn(
                "relative flex flex-col overflow-hidden rounded-3xl bg-primary text-primary-foreground",
                s.root,
                className,
            )}
        >
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute rounded-full border-primary-foreground/5",
                    s.ring,
                )}
            />
            <div className={cn("relative grid", s.text)}>
                {eyebrow && <p className="mb-4 opacity-70">{eyebrow}</p>}
                <p className="opacity-70">{label}</p>
                <p
                    className={cn(
                        "font-bold tracking-tight tabular-nums",
                        s.amount,
                    )}
                >
                    {baht(amount)}
                </p>
                {caption && <p className="opacity-70">{caption}</p>}
            </div>
            {progress && (
                <InstallmentProgress
                    variant="onPrimary"
                    value={progress.value}
                    label={progress.label}
                />
            )}
        </section>
    );
}
