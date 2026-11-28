import { CalendarDays, ChevronRight } from "lucide-react";
import type { MyDebtItem } from "@/app/actions/debts/my-debt.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MyDebtDetailDrawer } from "./my-debt-detail-drawer";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";

export function MyDebtCard({ debt }: { debt: MyDebtItem }) {
    const status = debtStatus(debt);
    const overdue = status === "overdue";
    const dueToday = status === "today";
    const pct = debt.installments
        ? Math.round((debt.paidCount / debt.installments) * 100)
        : 0;

    return (
        <MyDebtDetailDrawer
            debt={debt}
            className={cn(overdue && "ring-destructive/40")}
        >
            <div className="flex items-center gap-3">
                <Avatar className="size-10 rounded-xl after:rounded-xl">
                    {debt.loanImageUrl && (
                        <AvatarImage
                            src={debt.loanImageUrl}
                            alt=""
                            className="rounded-xl"
                        />
                    )}
                    <AvatarFallback className="rounded-xl font-semibold">
                        {debt.loanName.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                        ยอดกู้ {baht(debt.amount)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {debt.loanName} · {FREQUENCY_LABELS[debt.frequency]}
                    </p>
                </div>
                <DebtStatusBadge status={status} />
            </div>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className="text-xs text-muted-foreground">คงเหลือ</p>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">
                        {baht(debt.remaining)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">งวดละ</p>
                    <p className="font-semibold tabular-nums">
                        {baht(debt.payment)}
                    </p>
                </div>
            </div>

            <Progress
                value={pct}
                className="gap-2 *:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-indicator]:rounded-full"
            >
                <ProgressLabel className="text-xs font-normal text-muted-foreground tabular-nums">
                    ชำระแล้ว {debt.paidCount}/{debt.installments} งวด
                </ProgressLabel>
                <ProgressValue className="text-xs" />
            </Progress>

            <div className="-mx-4 -mb-4 flex items-center justify-between gap-2 border-t px-4 py-3 text-sm">
                {debt.nextDue ? (
                    <span
                        className={cn(
                            "flex min-w-0 items-center gap-1.5",
                            overdue
                                ? "font-medium text-destructive"
                                : dueToday
                                  ? "font-medium text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground",
                        )}
                    >
                        <CalendarDays className="size-4 shrink-0" />
                        <span className="truncate">
                            {overdue ? "ค้างชำระตั้งแต่ " : "งวดถัดไป "}
                            {dueToday
                                ? "วันนี้"
                                : thaiDate(debt.nextDue.dueDate)}
                        </span>
                    </span>
                ) : (
                    <span className="text-muted-foreground">ผ่อนครบแล้ว</span>
                )}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
        </MyDebtDetailDrawer>
    );
}
