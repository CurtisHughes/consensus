import { describe, expect, it } from 'vitest';
import { suggestDates } from '@/utils/suggestions';

const today = new Date(2026, 9, 15);

function vote(author: string, day: number, month = 9, year = 2026) {
  return { author, value: { year, month, day } };
}

describe('suggestDates', () => {
  it('returns nothing without responses', () => {
    expect(suggestDates([], { today })).toEqual([]);
  });

  it('ranks dates by vote count', () => {
    const suggestions = suggestDates(
      [vote('a', 20), vote('a', 18), vote('b', 18), vote('c', 18), vote('b', 20)],
      { today },
    );
    expect(suggestions).toEqual([
      { date: new Date(2026, 9, 18), count: 3, authors: ['a', 'b', 'c'] },
      { date: new Date(2026, 9, 20), count: 2, authors: ['a', 'b'] },
    ]);
  });

  it('breaks ties by the earliest date', () => {
    const suggestions = suggestDates([vote('a', 25), vote('a', 16, 10), vote('a', 16)], { today });
    expect(suggestions.map(({ date }) => date)).toEqual([
      new Date(2026, 9, 16),
      new Date(2026, 9, 25),
      new Date(2026, 10, 16),
    ]);
  });

  it('returns at most the limit', () => {
    const responses = [vote('a', 16), vote('a', 17), vote('a', 18), vote('a', 19)];
    expect(suggestDates(responses, { today })).toHaveLength(3);
    expect(suggestDates(responses, { today, limit: 2 })).toHaveLength(2);
    expect(suggestDates(responses, { today, limit: Infinity })).toHaveLength(4);
  });

  it('excludes dates before today but keeps today', () => {
    const suggestions = suggestDates([vote('a', 14), vote('a', 15), vote('b', 1, 9, 2025)], {
      today: new Date(2026, 9, 15, 18, 30),
    });
    expect(suggestions).toEqual([{ date: new Date(2026, 9, 15), count: 1, authors: ['a'] }]);
  });

  it('counts each author once per date', () => {
    expect(suggestDates([vote('a', 20), vote('a', 20), vote('b', 20)], { today })).toEqual([
      { date: new Date(2026, 9, 20), count: 2, authors: ['a', 'b'] },
    ]);
  });
});
