import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function shortDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function isoDate(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd');
}
