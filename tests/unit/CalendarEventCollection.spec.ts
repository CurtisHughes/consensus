import { describe, expect, it } from 'vitest';
import { CalendarEventCollection } from '@/components/DatePicker/models';

describe('CalendarEventCollection', () => {
  const date = { year: 2026, month: 10, day: 31 };

  it('returns undefined for dates without events', () => {
    expect(new CalendarEventCollection().get(date)).toBeUndefined();
  });

  it('groups events by date', () => {
    const collection = new CalendarEventCollection()
      .add(date, { checked: true })
      .add(date, {})
      .add({ ...date, day: 1 }, {});

    expect(collection.get(date)).toEqual([{ checked: true }, {}]);
    expect(collection.get({ ...date, day: 1 })).toEqual([{}]);
  });

  it('iterates over each date with its events', () => {
    const collection = new CalendarEventCollection().add(date, {}).add({ ...date, month: 0 }, {});

    expect(Array.from(collection)).toEqual([
      { date, events: [{}] },
      { date: { ...date, month: 0 }, events: [{}] },
    ]);
  });
});
