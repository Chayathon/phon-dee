export const baht = (n: number) =>
    `฿${n.toLocaleString("th-TH", { maximumFractionDigits: 2 })}`;

export const percent = (part: number, whole: number) =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;
