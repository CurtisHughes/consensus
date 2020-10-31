export type CalendarDate = {
  year: number;
  day: number;
  month: number;
}

export type CalendarEvent = {
  checked?: boolean;
}

export class CalendarEventCollection {
  private values: { [date: string]: CalendarEvent[] } = {};

  public add(date: CalendarDate, event: CalendarEvent) {
    const formattedDate = this.format(date);
    this.values[formattedDate] = [
      ...(this.values[formattedDate] || []),
      event,
    ];
    return this;
  }

  public get(date: CalendarDate) {
    const formattedDate = this.format(date);
    return this.values[formattedDate];
  }

  // eslint-disable-next-line class-methods-use-this
  private format({ day, month, year }: CalendarDate) {
    return `${year}-${month}-${day}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private parse(date: string) {
    const [year, month, day] = date.split('-');
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    };
  }

  /* eslint-disable */
  *[Symbol.iterator]() {
    const keys = Object.keys(this.values);

    for (const key of keys) {
      yield {
        events: this.values[key],
        date: this.parse(key),
      };
    }
  }
  /* eslint-enable */
}
