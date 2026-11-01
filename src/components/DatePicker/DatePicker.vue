<template>
  <div class="date-picker">
    <header>
      <button
        type="button"
        :class="['arrow', { 'has-votes': hasEarlierVotes }]"
        :aria-label="hasEarlierVotes ? 'Previous month, has votes' : 'Previous month'"
        :disabled="atCurrentMonth"
        @click="go(-1)"
      >
        <DatePickerArrow inverse />
      </button>
      <div class="title">
        <h3 :id="titleId" aria-live="polite">
          {{ date.toLocaleString('default', { month: 'long' }) }} {{ year }}
        </h3>
        <button v-if="!showingToday" type="button" class="today" @click="show(today)">Today</button>
      </div>
      <button
        type="button"
        :class="['arrow', { 'has-votes': hasLaterVotes }]"
        :aria-label="hasLaterVotes ? 'Next month, has votes' : 'Next month'"
        @click="go(1)"
      >
        <DatePickerArrow />
      </button>
    </header>

    <div
      ref="grid"
      role="grid"
      class="grid"
      :aria-labelledby="titleId"
      @keydown="onKeydown"
      @pointerdown="swipe.onPointerdown"
      @pointerup="swipe.onPointerup"
      @pointercancel="swipe.onPointercancel"
      @click.capture="swipe.onClickCapture"
    >
      <div role="rowgroup">
        <div role="row" class="week weekdays">
          <div
            v-for="weekday in weekdays"
            :key="weekday.long"
            role="columnheader"
            class="weekday"
            :aria-label="weekday.long"
          >
            <abbr :title="weekday.long">{{ weekday.narrow }}</abbr>
          </div>
        </div>
      </div>

      <div :key="shownMonth" role="rowgroup" :class="['weeks', direction && `slide-${direction}`]">
        <div v-for="(week, row) in weeks" :key="row" role="row" class="week">
          <template v-for="(day, column) in week" :key="column">
            <DatePickerDay
              v-if="day !== null"
              :day="day"
              :label="dayLabel(day)"
              :highlighted="isToday(day)"
              :disabled="isPast(day)"
              :focusable="day === tabbableDay"
              :max="maxVotes"
              :events="collection.get({ day, month, year }) || []"
              @select="onSelect"
              @focus="onFocus"
            />
            <div v-else role="gridcell" class="blank" />
          </template>
        </div>
      </div>
    </div>

    <div class="legend" aria-hidden="true">
      <span class="legend-item">
        <span class="swatch heat" />
        More people free
      </span>
      <span class="legend-item">
        <span class="swatch mine" />
        Your pick
      </span>
      <span class="legend-item">
        <span class="swatch today-swatch" />
        Today
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef } from 'vue';
import DatePickerDay from './DatePickerDay.vue';
import DatePickerArrow from './DatePickerArrow.vue';
import { CalendarEventCollection, type CalendarDate } from './models';
import { useSwipe } from '@/composables/useSwipe';

const props = withDefaults(
  defineProps<{
    collection?: CalendarEventCollection;
  }>(),
  {
    collection: () => new CalendarEventCollection(),
  },
);

const emit = defineEmits<{
  select: [date: CalendarDate];
}>();

const WEEKS = 6;
const SUNDAY = new Date(2023, 0, 1);

const titleId = useId();
const grid = useTemplateRef('grid');

const today = new Date();
const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const date = ref(new Date());
const direction = ref<'next' | 'prev' | null>(null);
const focused = ref<CalendarDate | null>(null);

const weekdays = Array.from({ length: 7 }, (_, i) => {
  const weekday = new Date(SUNDAY.getFullYear(), SUNDAY.getMonth(), SUNDAY.getDate() + i);
  return {
    narrow: weekday.toLocaleDateString('default', { weekday: 'narrow' }),
    long: weekday.toLocaleDateString('default', { weekday: 'long' }),
  };
});

const year = computed(() => date.value.getFullYear());
const month = computed(() => date.value.getMonth());
const offset = computed(() => new Date(year.value, month.value).getDay());
const days = computed(() => new Date(year.value, month.value + 1, 0).getDate());

const weeks = computed(() => {
  const cells: (number | null)[] = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const day = i - offset.value + 1;
    return day >= 1 && day <= days.value ? day : null;
  });
  return Array.from({ length: WEEKS }, (_, row) => cells.slice(row * 7, row * 7 + 7));
});

function monthIndex(y: number, m: number): number {
  return y * 12 + m;
}

const currentMonth = monthIndex(today.getFullYear(), today.getMonth());
const shownMonth = computed(() => monthIndex(year.value, month.value));
const atCurrentMonth = computed(() => shownMonth.value <= currentMonth);

const upcoming = computed(() =>
  Array.from(props.collection).filter(
    ({ date: { year: y, month: m, day: d } }) => new Date(y, m, d) >= startOfToday,
  ),
);

const maxVotes = computed(() =>
  Array.from(props.collection).reduce((max, { events }) => Math.max(max, events.length), 0),
);

const hasEarlierVotes = computed(() =>
  upcoming.value.some(({ date: { year: y, month: m } }) => monthIndex(y, m) < shownMonth.value),
);
const hasLaterVotes = computed(() =>
  upcoming.value.some(({ date: { year: y, month: m } }) => monthIndex(y, m) > shownMonth.value),
);

function showMonth(index: number) {
  if (index === shownMonth.value) return;
  direction.value = index > shownMonth.value ? 'next' : 'prev';
  date.value = new Date(Math.floor(index / 12), index % 12);
}

function go(delta: number) {
  showMonth(Math.max(shownMonth.value + delta, currentMonth));
}

function show(target: Date) {
  showMonth(monthIndex(target.getFullYear(), target.getMonth()));
}

const swipe = useSwipe({ onLeft: () => go(1), onRight: () => go(-1) });

const showingToday = computed(() => shownMonth.value === currentMonth);

defineExpose({ show });

function isToday(day: number): boolean {
  return showingToday.value && today.getDate() === day;
}

function isPast(day: number): boolean {
  return new Date(year.value, month.value, day) < startOfToday;
}

function isPicked(day: number): boolean {
  return (
    props.collection
      .get({ year: year.value, month: month.value, day })
      ?.some((event) => event.checked) ?? false
  );
}

const tabbableDay = computed(() => {
  if (shownMonth.value < currentMonth) return null;
  const f = focused.value;
  if (f && monthIndex(f.year, f.month) === shownMonth.value && !isPast(f.day)) return f.day;
  for (let day = 1; day <= days.value; day++) {
    if (!isPast(day) && isPicked(day)) return day;
  }
  return showingToday.value ? today.getDate() : 1;
});

function dayLabel(day: number): string {
  return new Date(year.value, month.value, day).toLocaleDateString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function addDays(from: Date, delta: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + delta);
}

function addMonths(from: Date, delta: number): Date {
  const length = new Date(from.getFullYear(), from.getMonth() + delta + 1, 0).getDate();
  return new Date(from.getFullYear(), from.getMonth() + delta, Math.min(from.getDate(), length));
}

async function focusDate(target: Date) {
  const clamped = target < startOfToday ? startOfToday : target;
  focused.value = {
    year: clamped.getFullYear(),
    month: clamped.getMonth(),
    day: clamped.getDate(),
  };
  show(clamped);
  await nextTick();
  grid.value?.querySelector<HTMLButtonElement>('button.day[tabindex="0"]')?.focus();
}

function onKeydown(event: KeyboardEvent) {
  const day = tabbableDay.value;
  if (day === null || !(event.target as HTMLElement).closest('button.day')) return;
  const current = new Date(year.value, month.value, day);
  const targets: Record<string, () => Date> = {
    ArrowLeft: () => addDays(current, -1),
    ArrowRight: () => addDays(current, 1),
    ArrowUp: () => addDays(current, -7),
    ArrowDown: () => addDays(current, 7),
    Home: () => addDays(current, -current.getDay()),
    End: () => addDays(current, 6 - current.getDay()),
    PageUp: () => addMonths(current, -1),
    PageDown: () => addMonths(current, 1),
  };
  const target = targets[event.key];
  if (!target) return;
  event.preventDefault();
  focusDate(target());
}

function onFocus(day: number) {
  focused.value = { year: year.value, month: month.value, day };
}

function onSelect(day: number) {
  emit('select', { year: year.value, month: month.value, day });
}
</script>

<style scoped lang="scss">
.date-picker {
  max-width: 500px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
  text-align: center;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .today {
    padding: 2px 10px;
    border: 1px solid var(--border-color, #00000033);
    border-radius: 999px;
    background: white;
    color: var(--secondary-font-color, #2c3e508a);
    font: inherit;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: var(--primary-font-color, #2c3e50);
    }

    &:focus-visible {
      outline: 2px solid var(--app-color, #ff8a8a);
      outline-offset: 2px;
    }
  }

  .arrow {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    transition: background 0.15s;

    @media (hover: hover) {
      &:not(:disabled):hover {
        background: var(--surface-color, #e8e8e8);
      }
    }

    &:disabled {
      opacity: 0.25;
      cursor: default;
    }

    &:focus-visible {
      outline: 2px solid var(--app-color, #ff8a8a);
      outline-offset: 2px;
    }

    svg {
      width: 12px;
      height: 12px;
    }

    &.has-votes {
      background: color-mix(in srgb, var(--app-color, #ff8a8a) 45%, var(--surface-color, #e8e8e8));

      @media (hover: hover) {
        &:not(:disabled):hover {
          background: color-mix(
            in srgb,
            var(--app-color, #ff8a8a) 75%,
            var(--surface-color, #e8e8e8)
          );
        }
      }
    }
  }
}

.grid {
  margin-bottom: 12px;
  font-size: clamp(13px, 3.8vw, 18px);
  touch-action: pan-y;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.weeks {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.slide-next {
    animation: slide-in-next 0.18s ease-out;
  }

  &.slide-prev {
    animation: slide-in-prev 0.18s ease-out;
  }
}

@keyframes slide-in-next {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
}

@keyframes slide-in-prev {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
}

.weekdays {
  margin-bottom: 8px;
}

.weekday {
  color: var(--secondary-font-color, #2c3e508a);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-align: center;
  text-transform: uppercase;

  abbr {
    text-decoration: none;
  }
}

.blank {
  aspect-ratio: 1;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: var(--secondary-font-color, #2c3e508a);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 3px;
  }

  .heat {
    width: 32px;
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--app-color, #ff8a8a) 20%, var(--surface-color, #e8e8e8)),
      color-mix(in srgb, var(--app-color, #ff8a8a) 75%, var(--surface-color, #e8e8e8))
    );
  }

  .mine {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-font-color, #2c3e50);
  }

  .today-swatch {
    background: var(--surface-color, #e8e8e8);
    box-shadow: inset 0 0 0 2px var(--primary-font-color, #2c3e50);
  }
}
</style>
