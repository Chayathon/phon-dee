import type { Frequency } from "@/app/actions/loans/loan.types";

export type DueState = "OVERDUE" | "TODAY" | "UPCOMING";

export type MyInstallment = {
    no: number;
    amount: number;
    dueDate: string;
    paid: boolean;
    overdue: boolean;
};

export type MyNextDue = MyInstallment & { state: DueState };

export type MyDebtItem = {
    id: string;
    loanName: string;
    loanImageUrl: string | null;
    frequency: Frequency;
    amount: number;
    installments: number;
    payment: number;
    paidCount: number;
    paidAmount: number;
    remaining: number;
    overdueCount: number;
    nextDue: MyNextDue | null;
    schedule: MyInstallment[];
};

export type MyDebtsResult = {
    userName: string | null;
    debts: MyDebtItem[];
};
