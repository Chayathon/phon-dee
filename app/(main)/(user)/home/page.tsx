import { Suspense } from "react";
import { listMyDebts } from "@/app/actions/debts/my-debts";
import { DebtSummary } from "./_components/debt-summary";
import { HomeSkeleton } from "./_components/home-skeleton";
import { MyDebtCard } from "./_components/my-debt-card";
import { MyDebtEmpty } from "./_components/my-debt-empty";

async function MyDebts() {
    const { userName, debts } = await listMyDebts();

    // Debts still being paid first, overdue ones at the very top.
    const sorted = debts.toSorted(
        (a, b) =>
            Number(!a.nextDue) - Number(!b.nextDue) ||
            b.overdueCount - a.overdueCount,
    );

    return (
        <div className="flex flex-col gap-4">
            <DebtSummary userName={userName} debts={debts} />
            <div className="mt-2 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">รายการหนี้ของฉัน</h2>
                {sorted.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                        {sorted.length} รายการ
                    </span>
                )}
            </div>
            {sorted.length === 0 ? (
                <MyDebtEmpty />
            ) : (
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sorted.map((debt) => (
                        <MyDebtCard key={debt.id} debt={debt} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Suspense fallback={<HomeSkeleton />}>
                <MyDebts />
            </Suspense>
        </div>
    );
}
