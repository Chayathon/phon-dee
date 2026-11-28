import {
    type Frequency,
    type InterestMethod,
    PERIODS_PER_YEAR,
} from "@/lib/constants/loan";

export type InstallmentInput = {
    principal: number;
    annualRate: number;
    installments: number;
    frequency: Frequency;
    method: InterestMethod;
    roundUp?: boolean;
};

export type InstallmentResult = {
    payment: number;
    rawPayment: number;
    totalPayment: number;
    totalInterest: number;
};

/** Round to satang (2 decimals). */
export function roundMoney(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Round up to the next multiple of 10: 1,740.34 → 1,750 and 1,791.67 → 1,800.
 * Values already on a multiple of 10 are kept (1,750.00 → 1,750). The input is
 * rounded to satang first so float noise like 1750.0000000001 doesn't become 1,760.
 */
export function roundUpToTen(n: number): number {
    return Math.ceil(roundMoney(n) / 10) * 10;
}

/** Interest rate per period, as a fraction (15% p.a. monthly → 0.0125). */
export function periodicRate(annualRate: number, frequency: Frequency): number {
    return annualRate / 100 / PERIODS_PER_YEAR[frequency];
}

/**
 * Standard PMT for an amortizing loan (Effective Rate / ลดต้นลดดอก):
 *
 *     PMT = P × r / (1 − (1 + r)^−n)
 *
 * where `r` is the periodic rate and `n` the number of periods. At `r = 0` it
 * reduces to `P / n`.
 */
export function pmt(rate: number, periods: number, principal: number): number {
    if (rate === 0) return principal / periods;
    return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

/**
 * Flat Rate (คงที่): interest is charged on the full principal for every
 * period, then spread evenly:
 *
 *     PMT = P × (1 + r × n) / n
 */
export function flatPayment(
    rate: number,
    periods: number,
    principal: number,
): number {
    return (principal * (1 + rate * periods)) / periods;
}

/** Per-installment payment and totals for a loan's terms. */
export function calculateInstallment({
    principal,
    annualRate,
    installments,
    frequency,
    method,
    roundUp = true,
}: InstallmentInput): InstallmentResult {
    if (!(principal > 0) || !Number.isInteger(installments) || installments < 1)
        return { payment: 0, rawPayment: 0, totalPayment: 0, totalInterest: 0 };

    const rate = periodicRate(annualRate, frequency);
    const exact =
        method === "FLAT"
            ? flatPayment(rate, installments, principal)
            : pmt(rate, installments, principal);

    const rawPayment = roundMoney(exact);
    const payment = roundUp ? roundUpToTen(exact) : rawPayment;
    const totalPayment = roundMoney(payment * installments);

    return {
        payment,
        rawPayment,
        totalPayment,
        totalInterest: roundMoney(totalPayment - principal),
    };
}

/**
 * Split the principal equally across installments; the last one takes the
 * rounding remainder so the total is exact.
 */
export function principalSchedule(
    principal: number,
    installments: number,
): number[] {
    if (!(principal > 0) || !Number.isInteger(installments) || installments < 1)
        return [];

    const share = roundMoney(principal / installments);
    const shares = Array<number>(installments).fill(share);
    shares[installments - 1] = roundMoney(
        principal - share * (installments - 1),
    );

    return shares;
}
