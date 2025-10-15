import { format as formatDate } from 'date-fns';

export function formatDateWithSettings(date: Date, dateFormat: string): string {
  return formatDate(date, dateFormat);
}

export function formatDateTimeWithSettings(date: Date, dateFormat: string): string {
  return formatDate(date, `${dateFormat} HH:mm`);
}

export function formatTimeOnly(date: Date): string {
  return formatDate(date, 'h:mm a');
}
