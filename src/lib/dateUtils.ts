// frontend/src/lib/dateUtils.ts
// Date formatting and manipulation helpers used across the app.
// All helpers are pure functions — no side effects.

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

/** Format an ISO string or Date as "Mon, Jul 7" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE, MMM d');
}

/** Format an ISO string or Date as "Jul 7, 2026" */
export function formatFullDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/** Format as "3:45 PM" */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/** "2 hours ago" / "in 3 days" */
export function fromNow(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Get all days in the current week (Mon–Sun). */
export function getWeekDays(referenceDate = new Date()): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end   = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/** Get all days in the month containing referenceDate. */
export function getMonthDays(referenceDate = new Date()): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(referenceDate),
    end: endOfMonth(referenceDate),
  });
}

export { isToday, isTomorrow, isYesterday, isSameDay, addDays, subDays, parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek };
