import { roundMoney } from "@/lib/interest";

export type DueStatus = "OVERDUE" | "TODAY";

type ScheduleRow = {
    no: number;
    amount: number;
    dueDate: string;
    paid: boolean;
};

export function dueStatus(dueIso: string, todayIso: string): DueStatus | null {
    if (dueIso < todayIso) return "OVERDUE";
    if (dueIso === todayIso) return "TODAY";
    return null;
}

export function dueInstallments<T extends ScheduleRow>(
    rows: T[],
    todayIso: string,
): T[] {
    const unpaid = rows.filter((r) => !r.paid);
    const due = unpaid.filter((r) => r.dueDate <= todayIso);
    return due.length > 0 ? due : unpaid.slice(0, 1);
}

export const sumAmount = (rows: { amount: number }[]) =>
    roundMoney(rows.reduce((total, r) => total + r.amount, 0));
