import {
    CalendarDays,
    Check,
    CircleCheck,
    MessageCircle,
    Pencil,
    Trash2,
} from "lucide-react";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    const done = debtor.paidCount >= debtor.installments;
    const name = debtor.userName ?? "ลูกหนี้";

    return (
        <Card
            className={cn(
                "relative gap-3 rounded-3xl p-4 transition-colors has-[>button:first-child:hover]:bg-muted/50",
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
                <Avatar>
                    {debtor.userPicture && (
                        <AvatarImage src={debtor.userPicture} alt="" />
                    )}
                    <AvatarFallback>
                        {(debtor.userName ?? "?").slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                        {debtor.userName ?? "ไม่ระบุชื่อ"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                        {debtor.loanName} · ยอดกู้ {baht(debtor.amount)}
                    </p>
                </div>
                {done ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CircleCheck data-icon="inline-start" />
                        ชำระครบแล้ว
                    </Badge>
                ) : (
                    <Badge>กำลังผ่อน</Badge>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">คงเหลือ</p>
                    <p className="text-2xl font-semibold">
                        {baht(debtor.remaining)}
                    </p>
                </div>
                <span className="text-sm text-muted-foreground">
                    {baht(debtor.payment)}/งวด
                </span>
            </div>

            <div className="grid gap-1.5">
                <Progress
                    value={(debtor.paidCount / debtor.installments) * 100}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        ชำระแล้ว {debtor.paidCount}/{debtor.installments} งวด
                    </span>
                    {debtor.nextDueDate && (
                        <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {thaiDate(debtor.nextDueDate)}
                        </span>
                    )}
                </div>
            </div>

            <div
                className={cn(
                    "relative flex items-center gap-1",
                    selecting && "hidden",
                )}
            >
                <Button
                    variant="outline"
                    size="sm"
                    className="mr-auto"
                    disabled={done}
                    onClick={() => onRemind(debtor)}
                >
                    <MessageCircle />
                    ส่งข้อความ
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={debtor.paidCount > 0}
                    onClick={() => onEdit(debtor)}
                >
                    <Pencil />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(debtor)}
                >
                    <Trash2 className="text-destructive" />
                </Button>
            </div>
        </Card>
    );
}
