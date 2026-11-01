export type CalendarDate = {
  year: number;
  day: number;
  month: number;
};

export type CalendarEvent = {
  checked?: boolean;
};

export class CalendarEventCollection {
  private values: { [date: string]: CalendarEvent[] } = {};

  public add(date: CalendarDate, event: CalendarEvent) {
    const formattedDate = CalendarEventCollection.format(date);
    this.values[formattedDate] = [...(this.values[formattedDate] || []), event];
    return this;
  }

  public get(date: CalendarDate): CalendarEvent[] | undefined {
    return this.values[CalendarEventCollection.format(date)];
  }

  private static format({ day, month, year }: CalendarDate) {
    return `${year}-${month}-${day}`;
  }

  private static parse(date: string): CalendarDate {
    const [year, month, day] = date.split('-');
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    };
  }

  *[Symbol.iterator]() {
    for (const [key, events] of Object.entries(this.values)) {
      yield {
        events,
        date: CalendarEventCollection.parse(key),
      };
    }
  }
}
