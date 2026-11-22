import { z } from "zod";

import {
    debtorSchema,
    type DebtorLoanTerms,
} from "@/app/(main)/manage/debtors/lib/debtor.schemas";
import type { ParseResult } from "@/app/actions/debtors/debtor.types";

export function parseDebtorForm(
    formData: FormData,
    loan: DebtorLoanTerms,
): ParseResult {
    const result = debtorSchema(loan).safeParse({
        amount: formData.get("amount"),
        installments: formData.get("installments"),
        firstDueDate: formData.get("firstDueDate"),
        roundUp: formData.get("roundUp"),
    });
    return result.success
        ? { ok: true, data: result.data }
        : {
              ok: false,
              error: result.error.issues[0].message,
              fieldErrors: z.flattenError(result.error).fieldErrors,
          };
}
