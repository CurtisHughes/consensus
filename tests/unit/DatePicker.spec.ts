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
    await wrapper.findAll('.day')[19]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[{ year: 2026, month: 9, day: 20 }]]);
  });

  it('disables days before today', async () => {
    const wrapper = mount(DatePicker);
    const days = wrapper.findAll('.day');
    expect(days[13]!.attributes('disabled')).toBeDefined();
    expect(days[14]!.attributes('disabled')).toBeUndefined();
    await days[4]!.trigger('click');
    expect(wrapper.emitted('select')).toBeUndefined();
  });

  it('labels each day with its date, vote count, and pressed state', () => {
    const collection = new CalendarEventCollection()
      .add({ year: 2026, month: 9, day: 20 }, { checked: true })
      .add({ year: 2026, month: 9, day: 20 }, {});
    const wrapper = mount(DatePicker, { props: { collection } });
    const day = wrapper.findAll('.day')[19]!;
    expect(day.attributes('aria-label')).toBe('October 20, 2026, 2 votes');
    expect(day.attributes('aria-pressed')).toBe('true');
    expect(wrapper.findAll('.day')[20]!.attributes('aria-pressed')).toBe('false');
  });

  it('navigates between months', async () => {
    const wrapper = mount(DatePicker);
    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    expect(wrapper.findAll('.day')).toHaveLength(30);
    await wrapper.findAll('.day')[0]!.trigger('click');
    expect(wrapper.emitted('select')).toEqual([[{ year: 2026, month: 10, day: 1 }]]);
  });

  it('shows the month of a given date', async () => {
    const wrapper = mount(DatePicker);
    wrapper.vm.show(new Date(2027, 1, 14));
    await wrapper.vm.$nextTick();
    expect(wrapper.get('header h2').text()).toBe('February 2027');
    expect(wrapper.findAll('.day')).toHaveLength(28);
  });

  it('offers a Today button only when away from the current month', async () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.find('.today').exists()).toBe(false);
    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    await wrapper.get('.today').trigger('click');
    expect(wrapper.get('header h2').text()).toBe('October 2026');
    expect(wrapper.find('.today').exists()).toBe(false);
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
