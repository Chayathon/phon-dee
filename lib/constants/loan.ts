import type { Frequency, InterestMethod } from "@/app/actions/loans/loan.types";

export const FREQUENCIES = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;

export const FREQUENCY_LABELS: Record<Frequency, string> = {
    WEEKLY: "รายสัปดาห์",
    BIWEEKLY: "รายสองสัปดาห์",
    MONTHLY: "รายเดือน",
};

export const PERIODS_PER_YEAR: Record<Frequency, number> = {
    WEEKLY: 52,
    BIWEEKLY: 26,
    MONTHLY: 12,
};

export const INTEREST_METHODS = ["EFFECTIVE", "FLAT"] as const;

export const INTEREST_METHOD_LABELS: Record<InterestMethod, string> = {
    EFFECTIVE: "ลดต้นลดดอก (Effective Rate)",
    FLAT: "คงที่ (Flat Rate)",
};
