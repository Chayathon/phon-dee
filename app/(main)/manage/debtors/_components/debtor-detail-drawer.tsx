"use client";

import { useState } from "react";
import {
    Banknote,
    CalendarCheck,
    CalendarPlus,
    Check,
    CircleAlert,
    HandCoins,
    type LucideIcon,
    PiggyBank,
    Repeat,
    Wallet,
} from "lucide-react";
import type {
    DebtorInstallment,
    DebtorItem,
} from "@/app/actions/debtors/debtor.types";
import {
    DebtStatusBadge,
    debtStatus,
    InstallmentStatusBadge,
    type InstallmentTone,
} from "@/components/debt/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Progress,
    ProgressLabel,
    ProgressValue,
} from "@/components/ui/progress";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { daysUntil, thaiDate } from "@/lib/date";
import { baht } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DebtorPayDialog } from "./debtor-pay-dialog";

type DebtorDetailDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debtor: DebtorItem | undefined;
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
    s: DebtorInstallment,
    nextNo: number | undefined,
): { tone: RowTone; days?: number } {
    if (s.paid) return { tone: "paid" };
    if (s.overdue) return { tone: "overdue", days: daysUntil(s.dueDate) };
    if (s.no === nextNo) return { tone: "next", days: daysUntil(s.dueDate) };
    return { tone: "wait" };
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
    const last = schedule.at(-1);
    const pct = debtor.installments
        ? Math.round((debtor.paidCount / debtor.installments) * 100)
        : 0;

    const details: { label: string; value: string; icon: LucideIcon }[] = [
        { label: "ผ่อนต่องวด", value: baht(debtor.payment), icon: Banknote },
        {
            label: "รอบชำระ",
            value: FREQUENCY_LABELS[debtor.frequency],
            icon: Repeat,
        },
        {
            label: "งวดแรก",
            value: thaiDate(debtor.firstDueDate),
            icon: CalendarPlus,
        },
        {
            label: "งวดสุดท้าย",
            value: last ? thaiDate(last.dueDate) : "-",
            icon: CalendarCheck,
        },
        { label: "ชำระแล้ว", value: baht(debtor.paidAmount), icon: Wallet },
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
                        <Avatar className="size-11">
                            {debtor.userPicture && (
                                <AvatarImage src={debtor.userPicture} alt="" />
                            )}
                            <AvatarFallback className="font-semibold">
                                {(debtor.userName ?? "?").slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <DrawerTitle className="truncate text-lg font-semibold">
                                {debtor.userName ?? "ไม่ระบุชื่อ"}
                            </DrawerTitle>
                            <DrawerDescription className="truncate">
                                {debtor.loanName} ·{" "}
                                {FREQUENCY_LABELS[debtor.frequency]}
                            </DrawerDescription>
                        </div>
                        <DebtStatusBadge status={debtStatus(debtor)} />
                    </DrawerHeader>

                    <div className="flex min-h-0 flex-1 touch-auto flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] *:shrink-0">
                        <section className="relative grid gap-5 overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -top-14 -right-14 size-44 rounded-full border-22 border-primary-foreground/5"
                            />
                            <div className="relative grid gap-0.5">
                                <span className="text-md opacity-70">
                                    คงเหลือ
                                </span>
                                <span className="text-4xl font-bold tracking-tight tabular-nums">
                                    {baht(debtor.remaining)}
                                </span>
                                <span className="text-md opacity-70">
                                    จากยอดกู้ {baht(debtor.amount)}
                                </span>
                            </div>
                            <Progress
                                value={pct}
                                className="relative gap-2 *:data-[slot=progress-track]:h-2 *:data-[slot=progress-track]:bg-primary-foreground/15 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-primary-foreground **:data-[slot=progress-indicator]:data-complete:bg-emerald-400"
                            >
                                <ProgressLabel className="text-sm font-normal tabular-nums opacity-70">
                                    ชำระแล้ว {debtor.paidCount}/
                                    {debtor.installments} งวด
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
                                    ควรติดตามทวงชำระโดยเร็ว
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

                        {schedule.length > 0 && (
                            <section className="rounded-2xl border px-4 pt-4 pb-2">
                                <div className="mb-3 flex items-baseline justify-between">
                                    <h3 className="font-semibold">ตารางผ่อน</h3>
                                    <span className="text-sm text-muted-foreground">
                                        {debtor.installments} งวด
                                    </span>
                                </div>
                                {/* Installments are a real sequence, so they read as a timeline. */}
                                <ol>
                                    {schedule.map((s, i) => {
                                        const { tone, days } = rowStatus(
                                            s,
                                            nextNo,
                                        );
                                        const t = TONES[tone];
                                        const isLast =
                                            i === schedule.length - 1;
                                        return (
                                            <li
                                                key={s.id}
                                                className="flex gap-3"
                                            >
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
                                                <div className="grid min-w-0 flex-1 gap-2 pt-1 pb-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="grid min-w-0 gap-0.5">
                                                            <span className="text-sm font-medium">
                                                                งวดที่ {s.no}
                                                            </span>
                                                            <span className="truncate text-xs text-muted-foreground">
                                                                {thaiDate(
                                                                    s.dueDate,
                                                                )}{" "}
                                                                · เงินต้น{" "}
                                                                {baht(
                                                                    s.principal,
                                                                )}
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
                                                    {!s.paid && (
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                s.no === nextNo
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            className="justify-self-end"
                                                            onClick={() =>
                                                                setPaying(s)
                                                            }
                                                        >
                                                            <HandCoins data-icon="inline-start" />
                                                            รับชำระ
                                                        </Button>
                                                    )}
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

            <DebtorPayDialog
                debtor={debtor}
                installment={paying}
                onClose={() => setPaying(null)}
            />
        </>
    );
}
