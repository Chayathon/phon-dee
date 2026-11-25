export const baht = (n: number) =>
    `฿${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
