import type { z } from "zod";

import type { loanSchema } from "@/app/(main)/manage/loans/lib/loan.schemas";
import type {
    FREQUENCIES,
    INTEREST_METHODS,
} from "@/app/(main)/manage/loans/lib/loan.constants";

export type Frequency = (typeof FREQUENCIES)[number];

export type InterestMethod = (typeof INTEREST_METHODS)[number];

export type LoanItem = {
    id: string;
    name: string;
    imageUrl: string | null;
    minAmount: number;
    maxAmount: number;
    frequency: Frequency;
    interestMethod: InterestMethod;
    interestRate: number;
    installments: number[];
    active: boolean;
};

export type LoanFields = z.output<typeof loanSchema>;

export type ParseResult =
    | { ok: true; data: LoanFields }
    | {
          ok: false;
          error: string;
          fieldErrors: Partial<Record<keyof LoanFields, string[]>>;
      };
