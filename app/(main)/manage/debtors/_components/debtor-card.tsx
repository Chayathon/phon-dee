import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";
import { InstallmentProgress } from "@/components/debt/installment-progress";
import { NextDueLine } from "@/components/debt/next-due-line";
import { IconButton } from "@/components/icon-button";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { baht, percent } from "@/lib/format";
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
    const name = debtor.userName ?? "ลูกหนี้";

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
                    <Checkbox
                        checked={selected}
                        disabled={done}
                        aria-hidden
                        tabIndex={-1}
                        className="pointer-events-none size-5 rounded-md"
                    />
                )}
                <UserAvatar
                    name={debtor.userName}
                    picture={debtor.userPicture}
                    className="size-10"
                />
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

            <InstallmentProgress
                value={percent(debtor.paidCount, debtor.installments)}
                label={`ชำระแล้ว ${debtor.paidCount}/${debtor.installments} งวด`}
            />

            <CardFooter className="-mx-4 min-h-13 justify-between gap-2 bg-transparent px-4 py-2 text-sm">
                <NextDueLine status={status} nextDue={debtor.nextDue} />

                <div
                    className={cn(
                        "relative flex shrink-0 items-center gap-0.5",
                        selecting && "invisible",
                    )}
                >
                    <IconButton
                        label="ส่งข้อความ"
                        disabled={done}
                        onClick={() => onRemind(debtor)}
                    >
                        <MessageCircle />
                    </IconButton>
                    <IconButton
                        label="แก้ไข"
                        disabled={debtor.paidCount > 0}
                        onClick={() => onEdit(debtor)}
                    >
                        <Pencil />
                    </IconButton>
                    <IconButton label="ลบ" onClick={() => onDelete(debtor)}>
                        <Trash2 className="text-destructive" />
                    </IconButton>
                </div>
            </CardFooter>
        </Card>
    );
}
