import {
    CalendarDays,
    Check,
    MessageCircle,
    Pencil,
    Trash2,
} from "lucide-react";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";

type DebtorCardProps = {
    debtor: DebtorItem;
    onView: (debtor: DebtorItem) => void;
    onEdit: (debtor: DebtorItem) => void;
    onDelete: (debtor: DebtorItem) => void;
    onRemind: (debtor: DebtorItem) => void;
    /** Selection mode for sending reminders to several debtors at once. */
    selecting?: boolean;
    selected?: boolean;
    onToggleSelect?: (debtor: DebtorItem) => void;
};

export function DebtorCard({
    debtor,
    onView,
    onEdit,
    onDelete,
    onRemind,
    selecting = false,
    selected = false,
    onToggleSelect,
}: DebtorCardProps) {
    const status = debtStatus(debtor);
    const done = status === "done";
    const overdue = status === "overdue";
    const dueToday = status === "today";
    const name = debtor.userName ?? "ลูกหนี้";
    const pct = debtor.installments
        ? Math.round((debtor.paidCount / debtor.installments) * 100)
        : 0;

    return (
        <Card
            className={cn(
                "relative gap-4 rounded-3xl p-4 transition-[background-color,box-shadow] has-[>button:first-child:hover]:bg-muted/40 has-[>button:first-child:hover]:shadow-md",
                overdue && "ring-destructive/40",
                selecting && done && "opacity-50",
                selected && "bg-primary/5 ring-2 ring-primary",
            )}
        >
            {selecting ? (
                <button
                    type="button"
                    aria-label={`เลือก ${name}`}
                    aria-pressed={selected}
                    disabled={done}
                    className="absolute inset-0 cursor-pointer rounded-3xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed"
                    onClick={() => onToggleSelect?.(debtor)}
                />
            ) : (
                <button
                    type="button"
                    aria-label={`ดูรายละเอียดหนี้ของ ${name}`}
                    className="absolute inset-0 cursor-pointer rounded-3xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() => onView(debtor)}
                />
            )}

            <div className="flex items-center gap-3">
                {selecting && (
                    <span
                        aria-hidden
                        className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                            selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input",
                        )}
                    >
                        {selected && <Check className="size-3.5" />}
                    </span>
                )}
                <Avatar className="size-10">
                    {debtor.userPicture && (
                        <AvatarImage src={debtor.userPicture} alt="" />
                    )}
                    <AvatarFallback className="font-semibold">
                        {(debtor.userName ?? "?").slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                        {debtor.userName ?? "ไม่ระบุชื่อ"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        ยอดกู้ {baht(debtor.amount)} · {debtor.loanName}
                    </p>
                </div>
                <DebtStatusBadge status={status} />
            </div>

            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className="text-xs text-muted-foreground">คงเหลือ</p>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">
                        {baht(debtor.remaining)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                        งวดละ · {FREQUENCY_LABELS[debtor.frequency]}
                    </p>
                    <p className="font-semibold tabular-nums">
                        {baht(debtor.payment)}
                    </p>
                </div>
            </div>

            <Progress
                value={pct}
                className="gap-2 *:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-indicator]:rounded-full"
            >
                <ProgressLabel className="text-xs font-normal text-muted-foreground tabular-nums">
                    ชำระแล้ว {debtor.paidCount}/{debtor.installments} งวด
                </ProgressLabel>
                <ProgressValue className="text-xs" />
            </Progress>

            <div className="-mx-4 -mb-4 flex min-h-13 items-center justify-between gap-2 border-t px-4 py-2 text-sm">
                {debtor.nextDue ? (
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
                                : thaiDate(debtor.nextDue.dueDate)}
                        </span>
                    </span>
                ) : (
                    <span className="text-muted-foreground">ผ่อนครบแล้ว</span>
                )}

                {/* `relative` lifts the actions above the full-card button. */}
                <div
                    className={cn(
                        "relative flex shrink-0 items-center gap-0.5",
                        selecting && "invisible",
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="ส่งข้อความ"
                        disabled={done}
                        onClick={() => onRemind(debtor)}
                    >
                        <MessageCircle />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="แก้ไข"
                        disabled={debtor.paidCount > 0}
                        onClick={() => onEdit(debtor)}
                    >
                        <Pencil />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="ลบ"
                        onClick={() => onDelete(debtor)}
                    >
                        <Trash2 className="text-destructive" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
