"use client";

import { useState } from "react";
import {
    Banknote,
    CalendarClock,
    CalendarDays,
    CalendarRange,
    Check,
    CircleAlert,
    CircleCheck,
    Clock,
    HandCoins,
    type LucideIcon,
    PiggyBank,
    ReceiptText,
    Repeat,
    Wallet,
} from "lucide-react";
import type {
    DebtorInstallment,
    DebtorItem,
} from "@/app/actions/debtors/debtor.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { daysUntil, thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DebtorPayDialog } from "./debtor-pay-dialog";

type DebtorDetailDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Kept while the drawer closes so the content doesn't vanish mid-animation. */
    debtor: DebtorItem | undefined;
};

type RowTone = "paid" | "overdue" | "next" | "wait";

const TONES: Record<
    RowTone,
    {
        row: string;
        dot: string;
        badge: string;
        variant: "destructive" | "secondary";
        icon: LucideIcon;
    }
> = {
    paid: {
        row: "",
        dot: "bg-emerald-600 text-white",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        variant: "secondary",
        icon: CircleCheck,
    },
    overdue: {
        row: "bg-destructive/5",
        dot: "bg-destructive/10 text-destructive",
        badge: "",
        variant: "destructive",
        icon: CircleAlert,
    },
    next: {
        row: "bg-amber-50/60 dark:bg-amber-950/30",
        dot: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        variant: "secondary",
        icon: CalendarClock,
    },
    wait: {
        row: "",
        dot: "bg-muted text-muted-foreground",
        badge: "text-muted-foreground",
        variant: "secondary",
        icon: Clock,
    },
};

function rowStatus(
    s: DebtorInstallment,
    nextNo: number | undefined,
): { tone: RowTone; label: string } {
    if (s.paid) return { tone: "paid", label: "ชำระแล้ว" };
    const days = daysUntil(s.dueDate);
    if (s.overdue) return { tone: "overdue", label: `เลยกำหนด ${-days} วัน` };
    if (s.no === nextNo)
        return {
            tone: "next",
            label: days === 0 ? "ครบกำหนดวันนี้" : `อีก ${days} วัน`,
        };
    return { tone: "wait", label: "รอชำระ" };
}

export function DebtorDetailDrawer({
    open,
    onOpenChange,
    debtor,
}: DebtorDetailDrawerProps) {
    const [paying, setPaying] = useState<DebtorInstallment | null>(null);

    if (!debtor) return null;

    const schedule = debtor.schedule;
    const nextNo = schedule.find((s) => !s.paid)?.no;
    const overdueRows = schedule.filter((s) => s.overdue);
    const overdueAmount = overdueRows.reduce((sum, s) => sum + s.amount, 0);
    const done = debtor.paidCount >= debtor.installments;
    const last = schedule.at(-1);

    const details: { label: string; value: string; icon: LucideIcon }[] = [
        { label: "ยอดกู้", value: baht(debtor.amount), icon: Banknote },
        { label: "ผ่อนต่องวด", value: baht(debtor.payment), icon: ReceiptText },
        {
            label: "รอบชำระ",
            value: FREQUENCY_LABELS[debtor.frequency],
            icon: Repeat,
        },
        {
            label: "งวดแรก – งวดสุดท้าย",
            value: last
                ? `${thaiDate(debtor.firstDueDate)} – ${thaiDate(last.dueDate)}`
                : "-",
            icon: CalendarRange,
        },
        {
            label: "ชำระแล้ว",
            value: baht(debtor.paidAmount),
            icon: CircleCheck,
        },
        {
            label: "เงินต้นคงเหลือ",
            value: baht(debtor.outstandingPrincipal),
            icon: PiggyBank,
        },
    ];

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
                <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-2rem)] sm:mx-auto sm:max-w-lg">
                    <DrawerHeader className="flex-row items-center gap-3 md:gap-3 group-data-[swipe-axis=y]/drawer-popup:text-left">
                        <Avatar size="lg">
                            {debtor.userPicture && (
                                <AvatarImage src={debtor.userPicture} alt="" />
                            )}
                            <AvatarFallback>
                                {(debtor.userName ?? "?").slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <DrawerTitle className="truncate text-lg font-bold">
                                {debtor.userName ?? "ไม่ระบุชื่อ"}
                            </DrawerTitle>
                            <DrawerDescription className="truncate">
                                {debtor.loanName}
                            </DrawerDescription>
                        </div>
                        {done ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CircleCheck data-icon="inline-start" />
                                ชำระครบแล้ว
                            </Badge>
                        ) : (
                            <Badge>กำลังผ่อน</Badge>
                        )}
                    </DrawerHeader>

                    {/* Single scroll area; `*:shrink-0` stops sections from being squashed instead of scrolling. */}
                    <div className="flex min-h-0 flex-1 touch-auto flex-col gap-4 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] *:shrink-0">
                        {overdueRows.length > 0 && (
                            <Alert
                                variant="destructive"
                                className="rounded-2xl border-destructive/20 bg-destructive/10 px-3.5 py-3"
                            >
                                <CircleAlert />
                                <AlertTitle className="font-semibold">
                                    ค้างชำระ {overdueRows.length} งวด
                                </AlertTitle>
                                <AlertDescription className="text-xs">
                                    รวม{" "}
                                    <span className="font-semibold">
                                        {baht(overdueAmount)}
                                    </span>
                                </AlertDescription>
                            </Alert>
                        )}

                        <section className="grid gap-3.5 rounded-2xl border p-4">
                            <div className="grid gap-1">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Wallet className="size-4" />
                                    ยอดค้างชำระ
                                </span>
                                <span className="text-3xl font-bold tabular-nums">
                                    {baht(debtor.remaining)}
                                </span>
                            </div>
                            <Progress
                                value={
                                    debtor.installments
                                        ? (debtor.paidCount /
                                              debtor.installments) *
                                          100
                                        : 0
                                }
                            />
                            <span className="text-muted-foreground">
                                ชำระแล้ว {debtor.paidCount} จาก{" "}
                                {debtor.installments} งวด
                            </span>
                            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3.5">
                                {details.map((d) => (
                                    <div key={d.label} className="grid gap-0.5">
                                        <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <d.icon className="size-3.5 shrink-0" />
                                            {d.label}
                                        </dt>
                                        <dd className="text-[15px] font-semibold tabular-nums">
                                            {d.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        {schedule.length > 0 && (
                            <section className="overflow-hidden rounded-2xl border">
                                <h3 className="flex items-center gap-2 px-4 py-3.5 text-base font-bold">
                                    <CalendarDays className="size-4.5 text-muted-foreground" />
                                    ตารางผ่อน
                                </h3>
                                <ol>
                                    {schedule.map((s) => {
                                        const { tone, label } = rowStatus(
                                            s,
                                            nextNo,
                                        );
                                        const t = TONES[tone];
                                        return (
                                            <li
                                                key={s.id}
                                                className={cn(
                                                    "flex min-h-15 items-center gap-3 border-t px-4 py-2.5",
                                                    t.row,
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
                                                        t.dot,
                                                    )}
                                                >
                                                    {s.paid ? (
                                                        <Check className="size-4" />
                                                    ) : (
                                                        s.no
                                                    )}
                                                </span>
                                                <div className="grid min-w-0 flex-1 justify-items-start gap-1">
                                                    <span className="font-semibold tabular-nums">
                                                        {baht(s.amount)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {thaiDate(s.dueDate)} ·
                                                        เงินต้น{" "}
                                                        {baht(s.principal)}
                                                    </span>
                                                    <Badge
                                                        variant={t.variant}
                                                        className={t.badge}
                                                    >
                                                        <t.icon data-icon="inline-start" />
                                                        {label}
                                                    </Badge>
                                                </div>
                                                {!s.paid && (
                                                    <Button
                                                        size="sm"
                                                        variant={
                                                            s.no === nextNo
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        onClick={() =>
                                                            setPaying(s)
                                                        }
                                                    >
                                                        <HandCoins data-icon="inline-start" />
                                                        รับชำระ
                                                    </Button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </section>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>

            <DebtorPayDialog
                debtor={debtor}
                installment={paying}
                onClose={() => setPaying(null)}
            />
        </>
    );
}
