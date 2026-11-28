import type { Frequency } from "@/app/actions/loans/loan.types";

export type UserOption = {
    id: string;
    name: string | null;
    picture: string | null;
};

export type DebtorInstallment = {
    id: string;
    no: number;
    amount: number;
    principal: number;
    dueDate: string;
    paid: boolean;
    overdue: boolean;
};

export type DebtorItem = {
    id: string;
    userId: string;
    userName: string | null;
    userPicture: string | null;
    loanId: string;
    loanName: string;
    frequency: Frequency;
    amount: number;
    installments: number;
    payment: number;
    paidCount: number;
    firstDueDate: string;
    overdueCount: number;
    nextDue: { dueDate: string } | null;
    paidAmount: number;
    remaining: number;
    outstandingPrincipal: number;
    schedule: DebtorInstallment[];
};

export type DebtorFields = {
    amount: number;
    installments: number;
    firstDueDate: string;
    roundUp: boolean;
};

export type ParseResult =
    | { ok: true; data: DebtorFields }
    | {
          ok: false;
          error: string;
          fieldErrors: Partial<Record<keyof DebtorFields, string[]>>;
      };

export type BulkRemindResult =
    | {
          ok: true;
          sentUsers: number;
          sentItems: number;
          sentTotal: number;
          failed: { name: string; error: string }[];
      }
    | { ok: false; error: string };
