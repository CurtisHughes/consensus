import { describe, expect, it } from 'vitest';
import { formatVoters } from '@/utils/voters';

const names = new Map([
  ['a', 'Alice'],
  ['b', 'Bob'],
  ['c', 'Carol'],
  ['d', 'Dan'],
  ['me', 'Curtis'],
]);

describe('formatVoters', () => {
  it('lists named voters with you first', () => {
    expect(formatVoters(['a', 'me', 'b'], names, 'me')).toBe('You, Alice, Bob');
  });

  it('groups voters past the limit and those without names', () => {
    expect(formatVoters(['a', 'b', 'c', 'd', 'x'], names, 'me')).toBe(
      'Alice, Bob, Carol + 2 others',
    );
    expect(formatVoters(['a', 'x'], names, 'me')).toBe('Alice + 1 other');
  });

  it('counts people when nobody has a name', () => {
    expect(formatVoters(['x'], names, 'me')).toBe('1 person');
    expect(formatVoters(['x', 'y'], names, 'me')).toBe('2 people');
  });

  it('calls you "You" even before you add a name', () => {
    expect(formatVoters(['new', 'x'], new Map(), 'new')).toBe('You + 1 other');
  });
});
