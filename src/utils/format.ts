export function formatDate(date: Date): string {
  return date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
}
