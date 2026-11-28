import { CalendarDays } from "lucide-react";
import type { DebtStatus } from "@/components/debt/status-badge";
import { thaiDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/** Card footer text: when the next installment is due, or that the debt is paid off. */
export function NextDueLine({
    status,
    nextDue,
}: {
    status: DebtStatus;
    nextDue: { dueDate: string } | null;
}) {
    if (!nextDue)
        return <span className="text-muted-foreground">ผ่อนครบแล้ว</span>;

    return (
        <span
            className={cn(
                "flex min-w-0 items-center gap-1.5",
                status === "overdue"
                    ? "font-medium text-destructive"
                    : status === "today"
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground",
            )}
        >
            <CalendarDays className="size-4 shrink-0" />
            <span className="truncate">
                {status === "overdue" ? "ค้างชำระตั้งแต่ " : "งวดถัดไป "}
                {status === "today" ? "วันนี้" : thaiDate(nextDue.dueDate)}
            </span>
        </span>
    );
}
