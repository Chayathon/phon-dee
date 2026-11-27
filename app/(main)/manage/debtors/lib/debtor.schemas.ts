import { z } from "zod";

import type { LoanItem } from "@/app/actions/loans/loan.types";

export type DebtorLoanTerms = Pick<
    LoanItem,
    "minAmount" | "maxAmount" | "installments"
>;

export function debtorSchema(loan: DebtorLoanTerms) {
    return z.object({
        amount: z.coerce
            .number("กรุณากรอกจำนวนเงิน")
            .min(
                loan.minAmount,
                `จำนวนเงินต้องไม่ต่ำกว่า ฿${loan.minAmount.toLocaleString()}`,
            )
            .max(
                loan.maxAmount,
                `จำนวนเงินต้องไม่เกิน ฿${loan.maxAmount.toLocaleString()}`,
            ),
        installments: z.coerce
            .number("กรุณาเลือกจำนวนงวด")
            .int()
            .refine((n) => loan.installments.includes(n), "จำนวนงวดไม่ถูกต้อง"),
        firstDueDate: z
            .string("กรุณาเลือกวันที่ชำระงวดแรก")
            .regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาเลือกวันที่ชำระงวดแรก"),
        roundUp: z
            .string()
            .nullish()
            .transform((v) => v === "true"),
    });
}
