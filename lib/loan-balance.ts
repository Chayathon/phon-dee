import type { Prisma } from "@/app/generated/prisma/client";
import { baht } from "@/lib/format";
import { roundMoney } from "@/lib/interest";

type Tx = Prisma.TransactionClient;

/** Float slack when comparing baht amounts stored as DOUBLE PRECISION. */
const EPSILON = 0.005;

/**
 * Deduct `amount` from the loan's available balance (on a draw).
 * Check + deduct is one UPDATE, so concurrent draws can't overspend.
 * Throws if the balance is too low.
 */
export async function drawFromLoan(
    tx: Tx,
    loanId: string,
    amount: number,
    message?: (available: number) => string,
): Promise<void> {
    if (amount <= 0) return;

    const { count } = await tx.loan.updateMany({
        where: { id: loanId, availableAmount: { gte: amount - EPSILON } },
        data: { availableAmount: { decrement: amount } },
    });
    if (count > 0) return;

    const loan = await tx.loan.findUnique({
        where: { id: loanId },
        select: { availableAmount: true },
    });
    if (!loan) throw new Error("ไม่พบสินเชื่อ");

    const available = Math.max(0, roundMoney(loan.availableAmount));

    throw new Error(
        message?.(available) ??
            `ยอดเงินที่เบิกได้ของสินเชื่อไม่เพียงพอ (คงเหลือ ${baht(available)})`,
    );
}

/** Add `amount` back to the loan's available balance (on payment or debt deletion). */
export async function returnToLoan(
    tx: Tx,
    loanId: string,
    amount: number,
): Promise<void> {
    if (amount <= 0) return;

    await tx.loan.update({
        where: { id: loanId },
        data: { availableAmount: { increment: amount } },
    });
}

/** Change the balance by `delta`: negative → draw, positive → return. */
export async function adjustLoanBalance(
    tx: Tx,
    loanId: string,
    delta: number,
    message?: (available: number) => string,
): Promise<void> {
    if (delta < 0) await drawFromLoan(tx, loanId, -delta, message);
    else await returnToLoan(tx, loanId, delta);
}
