import { z } from "zod";

import { loanSchema } from "@/app/(main)/manage/loans/lib/loan.schemas";
import type { ParseResult } from "@/app/actions/loans/loan.types";

export function parseLoanForm(formData: FormData): ParseResult {
    const result = loanSchema.safeParse({
        name: formData.get("name"),
        minAmount: formData.get("minAmount"),
        maxAmount: formData.get("maxAmount"),
        frequency: formData.get("frequency"),
        installments: formData.getAll("installments"),
        image: formData.get("image"),
    });
    return result.success
        ? { ok: true, data: result.data }
        : {
              ok: false,
              error: result.error.issues[0].message,
              fieldErrors: z.flattenError(result.error).fieldErrors,
          };
}
