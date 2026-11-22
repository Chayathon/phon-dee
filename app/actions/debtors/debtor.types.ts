import type { Frequency } from "@/app/actions/loans/loan.types";

export type UserOption = {
    id: string;
    name: string | null;
    picture: string | null;
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
    nextDueDate: string | null;
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
