import { Check } from "lucide-react";
import type { ReactNode } from "react";
import {
    InstallmentStatusBadge,
    type InstallmentTone,
} from "@/components/debt/status-badge";
import { daysUntil, thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TimelineInstallment = {
    no: number;
    dueDate: string;
    amount: number;
    paid: boolean;
    overdue: boolean;
};

type RowTone = "paid" | "overdue" | "next" | "wait";

const TONES: Record<
    RowTone,
    { dot: string; amount: string; badge: InstallmentTone }
> = {
    paid: {
        dot: "bg-emerald-500 text-white",
        amount: "text-muted-foreground",
        badge: "paid",
    },
    overdue: { dot: "bg-destructive text-white", amount: "", badge: "overdue" },
    next: {
        dot: "bg-amber-400 text-amber-950 ring-4 ring-amber-400/25",
        amount: "",
        badge: "soon",
    },
    wait: { dot: "bg-muted text-muted-foreground", amount: "", badge: "wait" },
};

function rowStatus(
    s: TimelineInstallment,
    nextNo: number | undefined,
): { tone: RowTone; days?: number } {
    if (s.paid) return { tone: "paid" };
    if (s.overdue) return { tone: "overdue", days: daysUntil(s.dueDate) };
    if (s.no === nextNo) return { tone: "next", days: daysUntil(s.dueDate) };
    return { tone: "wait" };
}

type InstallmentTimelineProps<T extends TimelineInstallment> = {
    schedule: T[];
    nextNo: number | undefined;
    renderDetail?: (row: T) => ReactNode;
    renderAction?: (row: T) => ReactNode;
};

/** Installment schedule as a vertical timeline, inside its own bordered section. */
export function InstallmentTimeline<T extends TimelineInstallment>({
    schedule,
    nextNo,
    renderDetail,
    renderAction,
}: InstallmentTimelineProps<T>) {
    if (schedule.length === 0) return null;

    return (
        <section className="rounded-2xl border px-4 pt-4 pb-2">
            <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-semibold">ตารางผ่อน</h3>
                <span className="text-sm text-muted-foreground">
                    {schedule.length} งวด
                </span>
            </div>
            <ol>
                {schedule.map((s, i) => {
                    const { tone, days } = rowStatus(s, nextNo);
                    const t = TONES[tone];
                    const isLast = i === schedule.length - 1;
                    const action = renderAction?.(s);
                    return (
                        <li key={s.no} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <span
                                    className={cn(
                                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums",
                                        t.dot,
                                    )}
                                >
                                    {s.paid ? (
                                        <Check className="size-4" />
                                    ) : (
                                        s.no
                                    )}
                                </span>
                                {!isLast && (
                                    <span
                                        className={cn(
                                            "w-0.5 flex-1",
                                            s.paid
                                                ? "bg-emerald-500/40"
                                                : "bg-border",
                                        )}
                                    />
                                )}
                            </div>
                            <div className="grid min-w-0 flex-1 gap-2 pt-1 pb-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid min-w-0 gap-0.5">
                                        <span className="text-sm font-medium">
                                            งวดที่ {s.no}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {thaiDate(s.dueDate)}
                                            {renderDetail?.(s)}
                                        </span>
                                    </div>
                                    <div className="grid justify-items-end gap-0.5 whitespace-nowrap">
                                        <span
                                            className={cn(
                                                "font-semibold tabular-nums",
                                                t.amount,
                                            )}
                                        >
                                            {baht(s.amount)}
                                        </span>
                                        <InstallmentStatusBadge
                                            tone={t.badge}
                                            days={days}
                                        />
                                    </div>
                                </div>
                                {action}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
