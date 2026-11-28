"use client";

import { useState } from "react";
import {
    Banknote,
    CalendarCheck,
    CalendarPlus,
    CircleAlert,
    HandCoins,
    PiggyBank,
    Repeat,
    Wallet,
} from "lucide-react";
import type {
    DebtorInstallment,
    DebtorItem,
} from "@/app/actions/debtors/debtor.types";
import { BalanceHero } from "@/components/debt/balance-hero";
import { type DetailItem, DetailGrid } from "@/components/detail-grid";
import { InstallmentTimeline } from "@/components/debt/installment-timeline";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { thaiDate } from "@/lib/date";
import { baht, percent } from "@/lib/format";
import { DebtorPayDialog } from "./debtor-pay-dialog";

type DebtorDetailDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    debtor: DebtorItem | undefined;
};

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

    const details: DetailItem[] = [
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
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-2rem)] sm:mx-auto sm:max-w-lg">
                <DrawerHeader className="flex-row items-center gap-3 md:gap-3 group-data-[swipe-axis=y]/drawer-popup:text-left">
                    <UserAvatar
                        name={debtor.userName}
                        picture={debtor.userPicture}
                        className="size-11"
                    />
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
                    <BalanceHero
                        label="คงเหลือ"
                        amount={debtor.remaining}
                        caption={`จากยอดกู้ ${baht(debtor.amount)}`}
                        progress={{
                            value: percent(debtor.paidCount, debtor.installments),
                            label: `ชำระแล้ว ${debtor.paidCount}/${debtor.installments} งวด`,
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
                                ควรติดตามทวงชำระโดยเร็ว
                            </AlertDescription>
                        </Alert>
                    )}

                    <DetailGrid items={details} />

                    <InstallmentTimeline
                        schedule={schedule}
                        nextNo={nextNo}
                        renderDetail={(s) => ` · เงินต้น ${baht(s.principal)}`}
                        renderAction={(s) =>
                            !s.paid && (
                                <Button
                                    size="sm"
                                    variant={s.no === nextNo ? "default" : "outline"}
                                    className="justify-self-end"
                                    onClick={() => setPaying(s)}
                                >
                                    <HandCoins data-icon="inline-start" />
                                    รับชำระ
                                </Button>
                            )
                        }
                    />
                </div>

                <DebtorPayDialog
                    debtor={debtor}
                    installment={paying}
                    onClose={() => setPaying(null)}
                />
            </DrawerContent>
        </Drawer>
    );
}
