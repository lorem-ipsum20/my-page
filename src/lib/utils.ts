export { cn } from "cn";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Format an ISO year-month for display: "2026-04" → "Apr 2026".
 * Content stores months rather than free text so dates stay sortable and can
 * be compared against the current month (e.g. to flag an expired credential).
 */
export function formatMonth(iso: string): string {
  const [year, month] = iso.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
