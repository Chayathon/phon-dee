"use client";

import {
    Banknote,
    CalendarCheck,
    CalendarDays,
    CalendarPlus,
    CircleAlert,
    Hourglass,
    Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import type { MyDebtItem } from "@/app/actions/debts/my-debt.types";
import { BalanceHero } from "@/components/debt/balance-hero";
import { type DetailItem, DetailGrid } from "@/components/detail-grid";
import { InstallmentTimeline } from "@/components/debt/installment-timeline";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";
import { LoanAvatar } from "@/components/loan-avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { thaiDate, thaiWeekday } from "@/lib/date";
import { baht, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

type MyDebtDetailDrawerProps = {
    debt: MyDebtItem;
    children: ReactNode;
    className?: string;
};

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
    const first = debt.schedule[0];
    const last = debt.schedule.at(-1);
    const overdueRows = debt.schedule.filter((s) => s.overdue);
    const overdueAmount = overdueRows.reduce((sum, s) => sum + s.amount, 0);
    const left = debt.installments - debt.paidCount;

    const details: DetailItem[] = [
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
                    <LoanAvatar
                        name={debt.loanName}
                        imageUrl={debt.loanImageUrl}
                        className="size-11"
                    />
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
                    <BalanceHero
                        label="คงเหลือ"
                        amount={debt.remaining}
                        caption={`จากยอดกู้ ${baht(debt.amount)}`}
                        progress={{
                            value: percent(debt.paidCount, debt.installments),
                            label: `ชำระแล้ว ${debt.paidCount}/${debt.installments} งวด`,
                        }}
                    />

                    {overdueRows.length > 0 && (
                        <Alert variant="danger" className="rounded-xl px-3.5 py-3">
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

                    <DetailGrid items={details} />

                    <InstallmentTimeline
                        schedule={debt.schedule}
                        nextNo={debt.nextDue?.no}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    );
}
