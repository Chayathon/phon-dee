import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/th";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);

const ISO_DATE = "YYYY-MM-DD";
const TZ = "Asia/Bangkok";

export const toDate = (iso: string) => dayjs.utc(iso).toDate();
export const toIso = (d: Date) => dayjs.utc(d).format(ISO_DATE);
export const today = () => dayjs().tz(TZ).format(ISO_DATE);

export const daysUntil = (iso: string, fromIso: string = today()) =>
    dayjs.utc(iso).diff(dayjs.utc(fromIso), "day");

const formatThai = (iso: string, pattern: string) =>
    dayjs(iso).locale("th").format(pattern);
export const thaiDate = (iso: string) => formatThai(iso, "D MMM BBBB");
export const thaiWeekday = (iso: string) => formatThai(iso, "dddd");
export const thaiMonth = (iso: string) => formatThai(iso, "MMMM BBBB");
