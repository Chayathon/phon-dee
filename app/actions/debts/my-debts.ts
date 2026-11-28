"use server";

import prisma from "@/lib/prisma";
import { toFileUrl } from "@/lib/file";
import { getSessionUser } from "@/lib/session";
import { toIso, today } from "@/lib/date";
import type { Frequency } from "@/app/actions/loans/loan.types";
import type {
    DueState,
    MyDebtItem,
    MyDebtsResult,
} from "@/app/actions/debts/my-debt.types";

function dueState(dueIso: string, todayIso: string): DueState {
    if (dueIso < todayIso) return "OVERDUE";
    if (dueIso === todayIso) return "TODAY";
    return "UPCOMING";
}

export async function listMyDebts(): Promise<MyDebtsResult> {
    const session = await getSessionUser();
    if (!session) return { userName: null, debts: [] };

    const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
            name: true,
            debts: {
                orderBy: { createdAt: "desc" },
                include: {
                    loan: {
                        select: { name: true, imageUrl: true, frequency: true },
                    },
                    installmentItems: { orderBy: { dueDate: "asc" } },
                },
            },
        },
    });
    if (!user) return { userName: null, debts: [] };

    const todayIso = today();

    const items: MyDebtItem[] = user.debts.map((d) => {
        const { loan } = d;
        const schedule = d.installmentItems.map((r, i) => ({
            no: i + 1,
            amount: r.amount,
            dueDate: toIso(r.dueDate),
            paid: r.paid,
            overdue: !r.paid && toIso(r.dueDate) < todayIso,
        }));

        const paid = schedule.filter((s) => s.paid);
        const unpaid = schedule.filter((s) => !s.paid);
        const next = unpaid[0];

        return {
            id: d.id,
            loanName: loan.name,
            loanImageUrl: loan.imageUrl ? toFileUrl(loan.imageUrl) : null,
            frequency: loan.frequency as Frequency,
            amount: d.amount,
            installments: schedule.length || d.installments,
            payment: schedule[0]?.amount ?? 0,
            paidCount: paid.length,
            paidAmount: paid.reduce((sum, s) => sum + s.amount, 0),
            remaining: unpaid.reduce((sum, s) => sum + s.amount, 0),
            overdueCount: schedule.filter((s) => s.overdue).length,
            nextDue: next
                ? { ...next, state: dueState(next.dueDate, todayIso) }
                : null,
            schedule,
        };
    });

    return { userName: user.name, debts: items };
}
