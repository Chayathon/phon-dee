import { CalendarCheck2, CalendarClock, CircleAlert } from "lucide-react";
import type { MyDebtItem } from "@/app/actions/debts/my-debt.types";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardFooter } from "@/components/ui/card";
import { BalanceHero } from "@/components/debt/balance-hero";
import { daysUntil, thaiMonth, thaiShortMonth, today } from "@/lib/date";
import { baht, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { InstallmentStatusBadge } from "@/components/debt/status-badge";

type DebtSummaryProps = {
    userName: string | null;
    debts: MyDebtItem[];
};

type DueRow = {
    key: string;
    loanName: string;
    loanAmount: number;
    no: number;
    amount: number;
    dueDate: string;
    overdue: boolean;
    /** Days until due: negative = overdue, 0 = today. */
    days: number;
};

function dueRows(debts: MyDebtItem[]) {
    const todayIso = today();
    const unpaid: DueRow[] = debts.flatMap((d) =>
        d.schedule
            .filter((s) => !s.paid)
            .map((s) => ({
                key: `${d.id}-${s.no}`,
                loanName: d.loanName,
                loanAmount: d.amount,
                no: s.no,
                amount: s.amount,
                dueDate: s.dueDate,
                overdue: s.overdue,
                days: daysUntil(s.dueDate, todayIso),
            })),
    );

    const overdue = unpaid.filter((r) => r.overdue);
    const upcoming = unpaid
        .filter((r) => !r.overdue)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const month = upcoming[0]?.dueDate.slice(0, 7) ?? null;

    const rows = [
        ...overdue,
        ...upcoming.filter((r) => r.dueDate.slice(0, 7) === month),
    ].sort(
        (a, b) =>
            a.dueDate.localeCompare(b.dueDate) ||
            a.loanName.localeCompare(b.loanName),
    );

    const dueTodayCount = upcoming.filter((r) => r.days === 0).length;
    return { rows, month, overdueCount: overdue.length, dueTodayCount };
}

/** Calendar-style tile */
function DateTile({ iso, days }: { iso: string; days: number }) {
    return (
        <div
            className={cn(
                "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
                days < 0
                    ? "bg-destructive text-white"
                    : days === 0
                      ? "bg-amber-400 text-amber-950"
                      : "bg-muted text-foreground",
            )}
        >
            <span className="text-lg font-bold tabular-nums">
                {Number(iso.slice(8, 10))}
            </span>
            <span className="mt-0.5 text-[11px] font-medium opacity-80">
                {thaiShortMonth(iso)}
            </span>
        </div>
    );
}

export function DebtSummary({ userName, debts }: DebtSummaryProps) {
    const remaining = debts.reduce((sum, d) => sum + d.remaining, 0);
    const paid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
    const active = debts.filter((d) => d.nextDue).length;
    const { rows, month, overdueCount, dueTodayCount } = dueRows(debts);
    const total = rows.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <BalanceHero
                size="lg"
                className={cn(debts.length === 0 && "lg:col-span-full")}
                eyebrow={`สวัสดี${userName ? `คุณ ${userName}` : ""}`}
                label="ยอดคงค้างทั้งหมด"
                amount={remaining}
                caption={
                    active > 0 ? `กำลังผ่อน ${active} รายการ` : "ไม่มียอดค้างชำระ"
                }
                progress={
                    paid + remaining > 0
                        ? {
                              value: percent(paid, paid + remaining),
                              label: `ชำระแล้ว ${baht(paid)}`,
                          }
                        : undefined
                }
            />

            {rows.length > 0 ? (
                <Card className="gap-0 rounded-3xl p-0">
                    <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
                        <h2 className="text-base font-semibold">
                            {month
                                ? `ต้องชำระ ${thaiMonth(`${month}-01`)}`
                                : "ต้องชำระ"}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {rows.length} รายการ
                        </span>
                    </div>

                    {(overdueCount > 0 || dueTodayCount > 0) && (
                        <div className="grid gap-2 px-5 pb-3">
                            {overdueCount > 0 && (
                                <Alert
                                    variant="danger"
                                    className="rounded-xl px-3.5 py-2.5"
                                >
                                    <CircleAlert />
                                    <AlertTitle>
                                        เลยกำหนด {overdueCount} รายการ
                                    </AlertTitle>
                                </Alert>
                            )}
                            {dueTodayCount > 0 && (
                                <Alert
                                    variant="warning"
                                    className="rounded-xl px-3.5 py-2.5"
                                >
                                    <CalendarClock />
                                    <AlertTitle>
                                        ครบกำหนดวันนี้ {dueTodayCount} รายการ
                                    </AlertTitle>
                                </Alert>
                            )}
                        </div>
                    )}

                    <ul className="divide-y px-5">
                        {rows.map((r) => (
                            <li
                                key={r.key}
                                className="flex items-center gap-3 py-3"
                            >
                                <DateTile iso={r.dueDate} days={r.days} />
                                <div className="grid min-w-0 flex-1 gap-0.5">
                                    <span className="truncate font-medium">
                                        ยอดกู้ {baht(r.loanAmount)}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {r.loanName} · งวดที่ {r.no}
                                    </span>
                                </div>
                                <div className="grid shrink-0 justify-items-end gap-0.5 whitespace-nowrap">
                                    <span className="text-base font-semibold tabular-nums">
                                        {baht(r.amount)}
                                    </span>
                                    <InstallmentStatusBadge
                                        tone={
                                            r.days < 0
                                                ? "overdue"
                                                : r.days === 0
                                                  ? "soon"
                                                  : "wait"
                                        }
                                        days={r.days}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <CardFooter className="mt-auto items-baseline justify-between gap-3 rounded-b-3xl px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                            ยอดรวมที่ต้องชำระ
                        </span>
                        <span className="text-2xl font-bold tabular-nums">
                            {baht(total)}
                        </span>
                    </CardFooter>
                </Card>
            ) : debts.length > 0 ? (
                <Card className="items-center justify-center gap-2 rounded-3xl p-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CalendarCheck2 className="size-6" />
                    </span>
                    <p className="font-semibold">ไม่มียอดที่ต้องชำระ</p>
                    <p className="text-sm text-muted-foreground">
                        คุณชำระครบทุกงวดแล้ว
                    </p>
                </Card>
            ) : null}
        </div>
    );
}
