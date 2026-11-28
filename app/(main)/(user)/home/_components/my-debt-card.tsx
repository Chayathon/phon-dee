import { ChevronRight } from "lucide-react";
import type { MyDebtItem } from "@/app/actions/debts/my-debt.types";
import { InstallmentProgress } from "@/components/debt/installment-progress";
import { NextDueLine } from "@/components/debt/next-due-line";
import { DebtStatusBadge, debtStatus } from "@/components/debt/status-badge";
import { LoanAvatar } from "@/components/loan-avatar";
import { CardFooter } from "@/components/ui/card";
import { FREQUENCY_LABELS } from "@/lib/constants/loan";
import { baht, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MyDebtDetailDrawer } from "./my-debt-detail-drawer";

export function MyDebtCard({ debt }: { debt: MyDebtItem }) {
    const status = debtStatus(debt);

    return (
        <MyDebtDetailDrawer
            debt={debt}
            className={cn(status === "overdue" && "ring-destructive/40")}
        >
            <div className="flex items-center gap-3">
                <LoanAvatar name={debt.loanName} imageUrl={debt.loanImageUrl} />
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

            <InstallmentProgress
                value={percent(debt.paidCount, debt.installments)}
                label={`ชำระแล้ว ${debt.paidCount}/${debt.installments} งวด`}
            />

            <CardFooter className="-mx-4 justify-between gap-2 bg-transparent px-4 py-3 text-sm">
                <NextDueLine status={status} nextDue={debt.nextDue} />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </CardFooter>
        </MyDebtDetailDrawer>
    );
}
