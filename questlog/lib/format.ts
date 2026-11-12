/** Formats an ISO `YYYY-MM-DD` due date the same way as the web app's `dueLabel`. */
export function dueLabel(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const difference = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (difference === 0) return 'Today';
  if (difference === 1) return 'Tomorrow';
  if (difference === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function isOverdue(value: string | null | undefined, completed: boolean): boolean {
  if (!value || completed) return false;
  return new Date(`${value}T23:59:59`) < new Date();
}
