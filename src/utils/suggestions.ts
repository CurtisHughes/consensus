import type { DateValue, Response } from '@/models';

export type Suggestion = {
  date: Date;
  count: number;
  authors: string[];
};

/**
 * Ranks upcoming dates by how many distinct people chose them, breaking ties by earliest date.
 * Pass `limit: Infinity` to get every upcoming date.
 */
export function suggestDates(
  responses: Response<DateValue>[],
  { today = new Date(), limit = 3 }: { today?: Date; limit?: number } = {},
): Suggestion[] {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const authorsByDate = new Map<number, Set<string>>();

  for (const { author, value } of responses) {
    const time = new Date(value.year, value.month, value.day).getTime();
    if (time < startOfToday.getTime()) continue;
    const authors = authorsByDate.get(time) ?? new Set<string>();
    authors.add(author);
    authorsByDate.set(time, authors);
  }

  return Array.from(authorsByDate, ([time, authors]) => ({
    date: new Date(time),
    count: authors.size,
    authors: Array.from(authors),
  }))
    .sort((a, b) => b.count - a.count || a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}
