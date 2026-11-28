import {
    CalendarClock,
    CircleAlert,
    CircleCheck,
    Clock,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { daysUntil } from "@/lib/date";
import { cn } from "@/lib/utils";

export type InstallmentTone = "overdue" | "soon" | "wait" | "paid" | "active";

const TONE_CLASS: Record<InstallmentTone, string> = {
    overdue: "",
    soon: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    wait: "",
    paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    active: "",
};

const TONE_ICON: Record<InstallmentTone, LucideIcon | null> = {
    overdue: CircleAlert,
    soon: CalendarClock,
    wait: Clock,
    paid: CircleCheck,
    active: null,
};

function dueLabel(days: number) {
    if (days < 0) return `เลยกำหนด ${-days} วัน`;
    if (days === 0) return "ครบกำหนดวันนี้";
    if (days === 1) return "พรุ่งนี้";
    return `อีก ${days} วัน`;
}

/** Default label per tone; `days` = days until due (negative = overdue). */
const TONE_LABEL: Record<InstallmentTone, (days?: number) => string> = {
    overdue: (d) => (d === undefined ? "เลยกำหนด" : dueLabel(d)),
    soon: (d) => (d === undefined ? "ครบกำหนดวันนี้" : dueLabel(d)),
    wait: (d) => (d === undefined ? "รอชำระ" : dueLabel(d)),
    paid: () => "ชำระแล้ว",
    active: () => "กำลังผ่อน",
};

/**
 * Status pill for a single installment — same colours on the home summary and the detail drawer.
 * Label comes from `tone` (+ `days` if given); pass `children` to override it.
 */
export function InstallmentStatusBadge({
    tone,
    days,
    children,
}: {
    tone: InstallmentTone;
    days?: number;
    children?: ReactNode;
}) {
    const Icon = TONE_ICON[tone];
    return (
        <Badge
            variant={
                tone === "overdue"
                    ? "destructive"
                    : tone === "wait"
                      ? "secondary"
                      : "default"
            }
            className={cn("tabular-nums", TONE_CLASS[tone])}
        >
            {Icon && <Icon data-icon="inline-start" />}
            {children ?? TONE_LABEL[tone](days)}
        </Badge>
    );
}

export type DebtStatus = "active" | "today" | "overdue" | "done";

/** The fields `debtStatus` needs — any debt shape (user or admin) that has these fits. */
type DebtStatusInput = {
    overdueCount: number;
    nextDue: { dueDate: string } | null;
};

/** Whole-debt status: paid off → overdue → due today → still paying. */
export function debtStatus(debt: DebtStatusInput): DebtStatus {
    if (!debt.nextDue) return "done";
    if (debt.overdueCount > 0) return "overdue";
    if (daysUntil(debt.nextDue.dueDate) === 0) return "today";
    return "active";
}

const DEBT_STATUS: Record<DebtStatus, { tone: InstallmentTone; label: string }> = {
    active: { tone: "active", label: "กำลังผ่อน" },
    today: { tone: "soon", label: "ชำระวันนี้" },
    overdue: { tone: "overdue", label: "ค้างชำระ" },
    done: { tone: "paid", label: "ชำระครบแล้ว" },
};

/** Whole-debt status pill for the debt card / drawer header. */
export function DebtStatusBadge({ status }: { status: DebtStatus }) {
    const { tone, label } = DEBT_STATUS[status];
    return <InstallmentStatusBadge tone={tone}>{label}</InstallmentStatusBadge>;
}
