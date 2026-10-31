import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import { CalendarEventCollection } from '@/components/DatePicker/models';

describe('DatePicker.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders every day of the current month', () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.findAll('.day')).toHaveLength(31);
    expect(wrapper.get('.day.highlighted').text()).toContain('15');
  });

  it('emits the selected date', async () => {
    const wrapper = mount(DatePicker);
    await wrapper.findAll('.day')[4]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[{ year: 2026, month: 9, day: 5 }]]);
  });

  it('navigates between months', async () => {
    const wrapper = mount(DatePicker);
    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    expect(wrapper.findAll('.day')).toHaveLength(30);
    await wrapper.findAll('.day')[0]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[{ year: 2026, month: 10, day: 1 }]]);
  });

  it('marks days that have a checked event', () => {
    const collection = new CalendarEventCollection().add(
      { year: 2026, month: 9, day: 3 },
      { checked: true },
    );
    const wrapper = mount(DatePicker, { props: { collection } });
    const checked = wrapper.findAll('.day-container.checked');
    expect(checked).toHaveLength(1);
    expect(checked[0]!.text()).toContain('3');
  });
});
