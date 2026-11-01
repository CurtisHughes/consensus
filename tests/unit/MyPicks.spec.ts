import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyPicks from '@/components/MyPicks.vue';

const picks = [new Date(2026, 9, 20), new Date(2026, 10, 3)];

describe('MyPicks.vue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('prompts you to pick days when you have none', () => {
    const wrapper = mount(MyPicks, { props: { picks: [] } });
    expect(wrapper.get('h2').text()).toBe('Your picks');
    expect(wrapper.text()).toContain('Tap days on the calendar to add them.');
    expect(wrapper.findAll('.chip')).toHaveLength(0);
  });

  it('lists your picks', () => {
    const wrapper = mount(MyPicks, { props: { picks } });
    expect(wrapper.get('h2').text()).toBe('You picked 2 days');
    expect(wrapper.findAll('.chip')).toHaveLength(2);
    expect(
      mount(MyPicks, { props: { picks: [picks[0]!] } })
        .get('h2')
        .text(),
    ).toBe('You picked 1 day');
  });

  it('shows or removes a pick', async () => {
    const wrapper = mount(MyPicks, { props: { picks } });
    const chip = wrapper.findAll('.chip')[1]!;
    await chip.get('.label').trigger('click');
    await chip.get('.remove').trigger('click');
    expect(wrapper.emitted('show')).toEqual([[picks[1]]]);
    expect(wrapper.emitted('remove')).toEqual([[picks[1]]]);
  });

  it('says when your picks are saving and then saved', async () => {
    vi.useFakeTimers();
    const wrapper = mount(MyPicks, { props: { picks } });
    const status = () => wrapper.get('[role="status"]').text();
    expect(status()).toBe('');

    await wrapper.setProps({ saving: true });
    expect(status()).toBe('Saving…');

    await wrapper.setProps({ saving: false });
    expect(status()).toBe('Saved');

    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();
    expect(status()).toBe('');
  });

  it("doesn't claim a failed save was saved", async () => {
    const wrapper = mount(MyPicks, { props: { picks, saving: true } });
    await wrapper.setProps({ saving: false, failed: true });
    expect(wrapper.get('[role="status"]').text()).toBe('');
  });
});
