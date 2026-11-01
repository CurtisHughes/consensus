import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PollResults from '@/components/PollResults.vue';
import type { Suggestion } from '@/utils/suggestions';

function suggestion(day: number, authors: string[]): Suggestion {
  return { date: new Date(2026, 9, day), count: authors.length, authors };
}

function mountResults(suggestions: Suggestion[], names: [string, string][] = []) {
  return mount(PollResults, {
    props: { suggestions, total: 4, participants: new Map(names), uid: 'me' },
  });
}

describe('PollResults.vue', () => {
  it('shows an empty state without votes', () => {
    expect(mountResults([]).text()).toContain('No votes yet');
  });

  it('badges the single best date', () => {
    const wrapper = mountResults([suggestion(20, ['a', 'b']), suggestion(21, ['a'])]);
    const badges = wrapper.findAll('.badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]!.text()).toBe('Best date');
    expect(wrapper.findAll('li')[0]!.text()).toContain('2 / 4');
  });

  it('badges every date tied for best', () => {
    const wrapper = mountResults([
      suggestion(20, ['a', 'b']),
      suggestion(21, ['a', 'c']),
      suggestion(22, ['a']),
    ]);
    expect(wrapper.findAll('.badge').map((badge) => badge.text())).toEqual([
      'Tied for best',
      'Tied for best',
    ]);
  });

  it('shows the top three dates until you ask for all of them', async () => {
    const wrapper = mountResults([20, 21, 22, 23, 24].map((day) => suggestion(day, ['a'])));
    expect(wrapper.findAll('li')).toHaveLength(3);

    const toggle = wrapper.get('.toggle');
    expect(toggle.text()).toBe('Show all 5 dates');
    await toggle.trigger('click');
    expect(wrapper.findAll('li')).toHaveLength(5);
    expect(toggle.text()).toBe('Show fewer');
    expect(toggle.attributes('aria-expanded')).toBe('true');
  });

  it('hides the toggle when every date fits', () => {
    expect(
      mountResults([suggestion(20, ['a'])])
        .find('.toggle')
        .exists(),
    ).toBe(false);
  });

  it('names who voted for each date', () => {
    const wrapper = mountResults(
      [suggestion(20, ['a', 'me', 'b'])],
      [
        ['a', 'Alice'],
        ['me', 'Curtis'],
      ],
    );
    expect(wrapper.get('.voters').text()).toBe('You, Alice + 1 other');
  });

  it('emits the date to show', async () => {
    const wrapper = mountResults([suggestion(20, ['a'])]);
    await wrapper.get('li button').trigger('click');
    expect(wrapper.emitted('show')).toEqual([[new Date(2026, 9, 20)]]);
  });

  it('lists named participants who have not picked a date, except you', () => {
    const wrapper = mountResults(
      [suggestion(20, ['a'])],
      [
        ['a', 'Alice'],
        ['c', 'Carol'],
        ['d', 'Dan'],
        ['me', 'Curtis'],
      ],
    );
    expect(wrapper.get('.waiting').text()).toBe('Waiting on: Carol, Dan');
  });
});
