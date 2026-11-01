<template>
  <div class="date-picker">
    <header>
      <button aria-label="Previous month" @click="prev">
        <DatePickerArrow inverse />
      </button>
      <div class="title">
        <h2>{{ date.toLocaleString('default', { month: 'long' }) }} {{ year }}</h2>
        <button v-if="!showingToday" type="button" class="today" @click="show(today)">Today</button>
      </div>
      <button aria-label="Next month" @click="next">
        <DatePickerArrow />
      </button>
    </header>

    <ul class="weekday-list">
      <li>
        <abbr title="Sunday">S</abbr>
      </li>
      <li>
        <abbr title="Monday">M</abbr>
      </li>
      <li>
        <abbr title="Tuesday">T</abbr>
      </li>
      <li>
        <abbr title="Wednesday">W</abbr>
      </li>
      <li>
        <abbr title="Thursday">T</abbr>
      </li>
      <li>
        <abbr title="Friday">F</abbr>
      </li>
      <li>
        <abbr title="Saturday">S</abbr>
      </li>
    </ul>

    <ul class="day-list">
      <li v-for="day in offset" :key="`prev-month-day-${day}`"></li>
      <DatePickerDay
        v-for="day in days"
        :key="`day-${day}`"
        :day="day"
        :label="dayLabel(day)"
        :highlighted="isToday(day)"
        :disabled="isPast(day)"
        :limit="dotLimit"
        :events="collection.get({ day, month, year }) || []"
        @select="onSelect"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import DatePickerDay from './DatePickerDay.vue';
import DatePickerArrow from './DatePickerArrow.vue';
import { CalendarEventCollection, type CalendarDate } from './models';
import { useMediaQuery } from '@/composables/useMediaQuery';

withDefaults(
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

const today = new Date();
const date = ref(new Date());

const year = computed(() => date.value.getFullYear());
const month = computed(() => date.value.getMonth());
const offset = computed(() => new Date(year.value, month.value).getDay());
const days = computed(() => new Date(year.value, month.value + 1, 0).getDate());

const wide = useMediaQuery('(min-width: 526px)');
const dotLimit = computed(() => (wide.value ? 4 : 3));

function next() {
  date.value = new Date(year.value, month.value + 1);
}

function prev() {
  date.value = new Date(year.value, month.value - 1);
}

function show(target: Date) {
  date.value = new Date(target.getFullYear(), target.getMonth());
}

const showingToday = computed(
  () => today.getFullYear() === year.value && today.getMonth() === month.value,
);

defineExpose({ show });

function isToday(day: number): boolean {
  return (
    today.getFullYear() === year.value &&
    today.getMonth() === month.value &&
    today.getDate() === day
  );
}

function isPast(day: number): boolean {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(year.value, month.value, day) < startOfToday;
}

function dayLabel(day: number): string {
  return new Date(year.value, month.value, day).toLocaleDateString('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2 {
    font-size: #{'min(5vw, 22.5px)'};
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

  > button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    height: #{'min(12vw, 60px)'};
    width: #{'min(12vw, 60px)'};

    svg {
      width: #{'min(3vw, 15px)'};
      height: #{'min(3vw, 15px)'};
    }
  }
}

ul {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 4px;
  padding: 0;
  place-items: start;
}

li {
  position: relative;
  list-style: none;
  width: 100%;
}

.day-list {
  font-size: #{'min(4vw, 20px)'};

  li {
    background: var(--surface-color, #e8e8e8);
    padding-bottom: 100%;
  }
}

.weekday-list {
  font-size: #{'min(5vw, 25px)'};
  text-align: center;

  li {
    color: var(--secondary-font-color, #2c3e508a);

    abbr {
      text-decoration: none;
    }
  }
}
</style>
