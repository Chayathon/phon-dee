import { dueInstallments, sumAmount } from "@/app/actions/debtors/debtor.due";
import type { DebtorItem } from "@/app/actions/debtors/debtor.types";
import { today } from "@/lib/date";

export type RemindGroup = {
    userId: string;
    userName: string | null;
    userPicture: string | null;
    items: number;
    overdue: number;
    dueToday: number;
    total: number;
};

export type RemindSummary = {
    groups: RemindGroup[];
    items: number;
    total: number;
};

export function summarizeReminders(debtors: DebtorItem[]): RemindSummary {
    const todayIso = today();
    const byUser = new Map<string, RemindGroup>();

    for (const d of debtors) {
        const due = dueInstallments(d.schedule, todayIso);

        if (due.length === 0) continue;
        const g = byUser.get(d.userId) ?? {
            userId: d.userId,
            userName: d.userName,
            userPicture: d.userPicture,
            items: 0,
            overdue: 0,
            dueToday: 0,
            total: 0,
        };

        g.items += due.length;
        g.overdue += due.filter((s) => s.dueDate < todayIso).length;
        g.dueToday += due.filter((s) => s.dueDate === todayIso).length;
        g.total = sumAmount([{ amount: g.total }, ...due]);
        byUser.set(d.userId, g);
    }

    const groups = [...byUser.values()].sort((a, b) => b.total - a.total);

    return {
        groups,
        items: groups.reduce((n, g) => n + g.items, 0),
        total: sumAmount(groups.map((g) => ({ amount: g.total }))),
    };
}
