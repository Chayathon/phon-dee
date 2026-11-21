export const baht = (n: number) =>
    `฿${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const thaiDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("th-TH", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
