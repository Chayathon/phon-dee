import type { Frequency } from "@/app/actions/loans/loan.types";

export const FREQUENCIES = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;

export const FREQUENCY_LABELS: Record<Frequency, string> = {
    WEEKLY: "รายสัปดาห์",
    BIWEEKLY: "รายสองสัปดาห์",
    MONTHLY: "รายเดือน",
};
