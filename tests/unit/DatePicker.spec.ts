import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
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
    expect(wrapper.get('header h3').text()).toBe('February 2027');
    expect(wrapper.findAll('.day')).toHaveLength(28);
  });

  it('offers a Today button only when away from the current month', async () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.find('.today').exists()).toBe(false);
    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    await wrapper.get('.today').trigger('click');
    expect(wrapper.get('header h3').text()).toBe('October 2026');
    expect(wrapper.find('.today').exists()).toBe(false);
  });

  it('marks your own picks', () => {
    const collection = new CalendarEventCollection()
      .add({ year: 2026, month: 9, day: 20 }, { checked: true })
      .add({ year: 2026, month: 9, day: 21 }, {});
    const wrapper = mount(DatePicker, { props: { collection } });
    const checked = wrapper.findAll('.day-container.checked');
    expect(checked).toHaveLength(1);
    expect(checked[0]!.text()).toContain('20');
    expect(checked[0]!.find('.pick-dot').exists()).toBe(true);
    expect(wrapper.findAll('.pick-dot')).toHaveLength(1);
  });

  it('shades days by how many people voted, without a visible count', () => {
    const collection = new CalendarEventCollection()
      .add({ year: 2026, month: 9, day: 20 }, {})
      .add({ year: 2026, month: 9, day: 21 }, {})
      .add({ year: 2026, month: 9, day: 21 }, {});
    const wrapper = mount(DatePicker, { props: { collection } });
    const days = wrapper.findAll('.day-container');
    expect(days[18]!.classes()).not.toContain('heated');
    expect(days[19]!.classes()).toContain('heated');
    expect(days[20]!.text()).toBe('21');
    expect(days[19]!.attributes('style')).toContain('48%');
    expect(days[20]!.attributes('style')).toContain('75%');
  });

  it('shows a legend', () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.get('.legend').text()).toContain('More people free');
    expect(wrapper.get('.legend').text()).toContain('Your pick');
  });

  it("can't go back before the current month", async () => {
    const wrapper = mount(DatePicker);
    const prev = wrapper.get('button[aria-label^="Previous month"]');
    expect(prev.attributes('disabled')).toBeDefined();
    await wrapper.get('button[aria-label^="Next month"]').trigger('click');
    expect(prev.attributes('disabled')).toBeUndefined();
    await prev.trigger('click');
    expect(wrapper.get('header h3').text()).toBe('October 2026');
  });

  it('points to months with upcoming votes', async () => {
    const collection = new CalendarEventCollection()
      .add({ year: 2026, month: 8, day: 30 }, {})
      .add({ year: 2026, month: 11, day: 5 }, {});
    const wrapper = mount(DatePicker, { props: { collection } });
    const prev = () => wrapper.get('button[aria-label^="Previous month"]');
    const next = () => wrapper.get('button[aria-label^="Next month"]');

    expect(prev().attributes('aria-label')).toBe('Previous month');
    expect(next().attributes('aria-label')).toBe('Next month, has votes');
    expect(prev().classes()).not.toContain('has-votes');
    expect(next().classes()).toContain('has-votes');

    wrapper.vm.show(new Date(2027, 0, 1));
    await wrapper.vm.$nextTick();
    expect(prev().attributes('aria-label')).toBe('Previous month, has votes');
    expect(next().attributes('aria-label')).toBe('Next month');
  });

  it('lays the month out as a six-week grid with empty cells around it', async () => {
    const wrapper = mount(DatePicker);
    const rows = () => wrapper.findAll('.weeks [role="row"]');
    expect(wrapper.get('[role="grid"]').attributes('aria-labelledby')).toBe(
      wrapper.get('header h3').attributes('id'),
    );
    expect(rows()).toHaveLength(6);
    rows().forEach((row) => expect(row.findAll('[role="gridcell"]')).toHaveLength(7));

    // October 2026 starts on a Thursday.
    const cells = wrapper.findAll('.weeks [role="gridcell"]');
    expect(cells.slice(0, 4).every((cell) => cell.classes('blank'))).toBe(true);
    expect(cells[4]!.text()).toBe('1');
    expect(wrapper.findAll('.blank')).toHaveLength(11);
    expect(wrapper.findAll('.blank button')).toHaveLength(0);

    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    expect(rows()).toHaveLength(6);
  });

  it('labels the weekday columns with their full names', () => {
    const wrapper = mount(DatePicker);
    const headers = wrapper.findAll('[role="columnheader"]');
    expect(headers.map((header) => header.text())).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    expect(headers.map((header) => header.get('abbr').attributes('title'))).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
  });

  it('labels today', () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.get('.day.highlighted').attributes('aria-label')).toBe(
      'October 15, 2026, today, 0 votes',
    );
  });

  it('slides in from the direction of travel', async () => {
    const wrapper = mount(DatePicker);
    expect(wrapper.get('.weeks').classes()).not.toContain('slide-next');
    await wrapper.get('button[aria-label="Next month"]').trigger('click');
    expect(wrapper.get('.weeks').classes()).toContain('slide-next');
    await wrapper.get('button[aria-label="Previous month"]').trigger('click');
    expect(wrapper.get('.weeks').classes()).toContain('slide-prev');
  });

  describe('keyboard', () => {
    let wrapper: ReturnType<typeof mount<typeof DatePicker>>;

    const tabbable = () => wrapper.findAll('button.day[tabindex="0"]');
    const focusedDay = () => document.activeElement?.querySelector('.day-number')?.textContent;
    const heading = () => wrapper.get('header h3').text();

    async function press(key: string) {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await flushPromises();
    }

    async function focus(day: number) {
      (wrapper.findAll('.day')[day - 1]!.element as HTMLButtonElement).focus();
      await flushPromises();
    }

    afterEach(() => {
      wrapper.unmount();
    });

    it('makes one day tabbable, starting on today', async () => {
      wrapper = mount(DatePicker, { attachTo: document.body });
      expect(tabbable()).toHaveLength(1);
      expect(tabbable()[0]!.text()).toBe('15');

      await wrapper.get('button[aria-label="Next month"]').trigger('click');
      expect(tabbable()).toHaveLength(1);
      expect(tabbable()[0]!.text()).toBe('1');
    });

    it('starts on your first pick', () => {
      const collection = new CalendarEventCollection()
        .add({ year: 2026, month: 9, day: 22 }, { checked: true })
        .add({ year: 2026, month: 9, day: 20 }, {});
      wrapper = mount(DatePicker, { props: { collection }, attachTo: document.body });
      expect(tabbable()).toHaveLength(1);
      expect(tabbable()[0]!.text()).toContain('22');
    });

    it('moves by day and week with the arrow keys, but not before today', async () => {
      wrapper = mount(DatePicker, { attachTo: document.body });
      await focus(15);
      await press('ArrowRight');
      expect(focusedDay()).toBe('16');
      await press('ArrowDown');
      expect(focusedDay()).toBe('23');
      await press('ArrowLeft');
      expect(focusedDay()).toBe('22');
      await press('ArrowUp');
      expect(focusedDay()).toBe('15');
      await press('ArrowUp');
      expect(focusedDay()).toBe('15');
      expect(tabbable()).toHaveLength(1);
    });

    it('jumps to the start and end of the week with Home and End', async () => {
      wrapper = mount(DatePicker, { attachTo: document.body });
      await focus(21);
      await press('Home');
      expect(focusedDay()).toBe('18');
      await press('End');
      expect(focusedDay()).toBe('24');
    });

    it('crosses into the next month and back', async () => {
      wrapper = mount(DatePicker, { attachTo: document.body });
      await focus(29);
      await press('ArrowDown');
      expect(heading()).toBe('November 2026');
      expect(focusedDay()).toBe('5');
      await press('ArrowUp');
      expect(heading()).toBe('October 2026');
      expect(focusedDay()).toBe('29');
    });

    it('changes month with Page Up and Page Down, keeping the day when it can', async () => {
      wrapper = mount(DatePicker, { attachTo: document.body });
      await focus(31);
      await press('PageDown');
      expect(heading()).toBe('November 2026');
      expect(focusedDay()).toBe('30');
      await press('PageDown');
      expect(heading()).toBe('December 2026');
      expect(focusedDay()).toBe('30');
      await press('PageUp');
      await press('PageUp');
      expect(heading()).toBe('October 2026');
      expect(focusedDay()).toBe('30');
      await press('PageUp');
      expect(heading()).toBe('October 2026');
      expect(focusedDay()).toBe('15');
    });
  });

  describe('swiping', () => {
    async function swipe(wrapper: ReturnType<typeof mount>, dx: number, dy = 0) {
      const grid = wrapper.get('[role="grid"]').element;
      const pointer = (type: string, clientX: number, clientY: number) =>
        grid.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
      pointer('pointerdown', 200, 200);
      pointer('pointerup', 200 + dx, 200 + dy);
      await flushPromises();
    }

    it('changes month on a horizontal swipe', async () => {
      const wrapper = mount(DatePicker);
      await swipe(wrapper, -80);
      expect(wrapper.get('header h3').text()).toBe('November 2026');
      await swipe(wrapper, 80);
      expect(wrapper.get('header h3').text()).toBe('October 2026');
      await swipe(wrapper, 80);
      expect(wrapper.get('header h3').text()).toBe('October 2026');
    });

    it('ignores short and mostly vertical drags', async () => {
      const wrapper = mount(DatePicker);
      await swipe(wrapper, -30);
      await swipe(wrapper, -60, 120);
      expect(wrapper.get('header h3').text()).toBe('October 2026');
    });

    it("doesn't pick a day at the end of a swipe", async () => {
      const wrapper = mount(DatePicker);
      await swipe(wrapper, -80);
      await wrapper.findAll('.day')[0]!.trigger('click');
      expect(wrapper.emitted('select')).toBeUndefined();
      await wrapper.findAll('.day')[0]!.trigger('click');
      expect(wrapper.emitted('select')).toEqual([[{ year: 2026, month: 10, day: 1 }]]);
    });
  });
});
