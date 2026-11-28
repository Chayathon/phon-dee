"use client";

import {
    Banknote,
    CalendarCheck,
    CalendarDays,
    CalendarPlus,
    Check,
    CircleAlert,
    Hourglass,
    type LucideIcon,
    Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
    MyDebtItem,
    MyInstallment,
} from "@/app/actions/debts/my-debt.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { daysUntil, thaiDate, thaiWeekday } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
    DebtStatusBadge,
    debtStatus,
    InstallmentStatusBadge,
    type InstallmentTone,
} from "@/components/debt/status-badge";

type MyDebtDetailDrawerProps = {
    debt: MyDebtItem;
    children: ReactNode;
    className?: string;
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
    overdue: {
        dot: "bg-destructive text-white",
        amount: "",
        badge: "overdue",
    },
    next: {
        dot: "bg-amber-400 text-amber-950",
        amount: "",
        badge: "soon",
    },
    wait: {
        dot: "bg-muted text-muted-foreground",
        amount: "",
        badge: "wait",
    },
};

function rowStatus(
    s: MyInstallment,
    nextNo: number | undefined,
): { tone: RowTone; days?: number } {
    if (s.paid) return { tone: "paid" };
    if (s.overdue) return { tone: "overdue", days: daysUntil(s.dueDate) };
    if (s.no === nextNo) return { tone: "next", days: daysUntil(s.dueDate) };
    return { tone: "wait" };
}

function paymentDay(debt: MyDebtItem): string {
    const first = debt.schedule[0]?.dueDate;
    if (!first) return "-";
    switch (debt.frequency) {
        case "MONTHLY":
            return `ทุกวันที่ ${Number(first.slice(8, 10))}`;
        case "WEEKLY":
            return `ทุกวัน${thaiWeekday(first)}`;
        case "BIWEEKLY":
            return `ทุก 2 สัปดาห์ วัน${thaiWeekday(first)}`;
    }
}

export function MyDebtDetailDrawer({
    debt,
    children,
    className,
}: MyDebtDetailDrawerProps) {
    const nextNo = debt.nextDue?.no;
    const first = debt.schedule[0];
    const last = debt.schedule.at(-1);
    const overdueRows = debt.schedule.filter((s) => s.overdue);
    const overdueAmount = overdueRows.reduce((sum, s) => sum + s.amount, 0);
    const left = debt.installments - debt.paidCount;

    const pct = debt.installments
        ? Math.round((debt.paidCount / debt.installments) * 100)
        : 0;

    const details: { label: string; value: string; icon: LucideIcon }[] = [
        { label: "ผ่อนต่องวด", value: baht(debt.payment), icon: Banknote },
        { label: "วันชำระ", value: paymentDay(debt), icon: CalendarDays },
        {
            label: "งวดแรก",
            value: first ? thaiDate(first.dueDate) : "-",
            icon: CalendarPlus,
        },
        {
            label: "งวดสุดท้าย",
            value: last ? thaiDate(last.dueDate) : "-",
            icon: CalendarCheck,
        },
        { label: "ชำระแล้ว", value: baht(debt.paidAmount), icon: Wallet },
        {
            label: "เหลืออีก",
            value: left > 0 ? `${left} งวด` : "ครบแล้ว",
            icon: Hourglass,
        },
    ];

    return (
        <Drawer showSwipeHandle>
            <DrawerTrigger
                nativeButton={false}
                render={
                    <Card
                        className={cn(
                            "cursor-pointer gap-4 rounded-3xl p-4 text-left transition-[background-color,box-shadow] outline-none hover:bg-muted/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            className,
                        )}
                    />
                }
            >
                {children}
            </DrawerTrigger>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-2rem)] sm:mx-auto sm:max-w-lg">
                <DrawerHeader className="flex-row items-center gap-3 md:gap-3 group-data-[swipe-axis=y]/drawer-popup:text-left">
                    <Avatar className="size-11 rounded-xl after:rounded-xl">
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
                        <DrawerTitle className="truncate text-lg font-semibold">
                            ยอดกู้ {baht(debt.amount)}
                        </DrawerTitle>
                        <DrawerDescription className="truncate">
                            {debt.loanName} · {FREQUENCY_LABELS[debt.frequency]}
                        </DrawerDescription>
                    </div>
                    <DebtStatusBadge status={debtStatus(debt)} />
                </DrawerHeader>

                <div className="flex min-h-0 flex-1 touch-auto flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] *:shrink-0">
                    <section className="relative grid gap-5 overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-14 -right-14 size-44 rounded-full border-22 border-primary-foreground/5"
                        />
                        <div className="relative grid gap-0.5">
                            <span className="text-md opacity-70">คงเหลือ</span>
                            <span className="text-4xl font-bold tracking-tight tabular-nums">
                                {baht(debt.remaining)}
                            </span>
                            <span className="text-md opacity-70">
                                จากยอดกู้ {baht(debt.amount)}
                            </span>
                        </div>
                        <Progress
                            value={pct}
                            className="relative gap-2 *:data-[slot=progress-track]:h-2 *:data-[slot=progress-track]:bg-primary-foreground/15 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-primary-foreground **:data-[slot=progress-indicator]:data-complete:bg-emerald-400"
                        >
                            <ProgressLabel className="text-sm font-normal tabular-nums opacity-70">
                                ชำระแล้ว {debt.paidCount}/{debt.installments}{" "}
                                งวด
                            </ProgressLabel>
                            <ProgressValue className="text-sm text-primary-foreground opacity-70" />
                        </Progress>
                    </section>

                    {overdueRows.length > 0 && (
                        <Alert
                            variant="destructive"
                            className="rounded-xl border-destructive/20 bg-destructive/10 px-3.5 py-3"
                        >
                            <CircleAlert />
                            <AlertTitle className="font-semibold">
                                ค้างชำระ {overdueRows.length} งวด ·{" "}
                                <span className="tabular-nums">
                                    {baht(overdueAmount)}
                                </span>
                            </AlertTitle>
                            <AlertDescription className="text-xs">
                                กรุณาชำระโดยเร็ว
                            </AlertDescription>
                        </Alert>
                    )}

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-2xl border p-4">
                        {details.map((d) => (
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

                    {debt.schedule.length > 0 && (
                        <section className="rounded-2xl border px-4 pt-4 pb-2">
                            <div className="mb-3 flex items-baseline justify-between">
                                <h3 className="font-semibold">ตารางผ่อน</h3>
                                <span className="text-sm text-muted-foreground">
                                    {debt.installments} งวด
                                </span>
                            </div>

                            <ol>
                                {debt.schedule.map((s, i) => {
                                    const { tone, days } = rowStatus(s, nextNo);
                                    const t = TONES[tone];
                                    const isLast =
                                        i === debt.schedule.length - 1;
                                    return (
                                        <li key={s.no} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={cn(
                                                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums",
                                                        t.dot,
                                                        tone === "next" &&
                                                            "ring-4 ring-amber-400/25",
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
                                            <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pt-1 pb-4">
                                                <div className="grid gap-0.5">
                                                    <span className="text-sm font-medium">
                                                        งวดที่ {s.no}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {thaiDate(s.dueDate)}
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
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
