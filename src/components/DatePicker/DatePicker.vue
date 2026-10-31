<template>
  <div class="date-picker">
    <header>
      <button aria-label="Previous month" @click="prev">
        <Arrow inverse />
      </button>
      <h1>{{ date.toLocaleString('default', { month: 'long' }) }} {{ year }}</h1>
      <button aria-label="Next month" @click="next">
        <Arrow />
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
      <Day
        v-for="day in days"
        :key="`day-${day}`"
        :day="day"
        :highlighted="isToday(day)"
        :events="collection.get({ day, month, year }) || []"
        @select="onSelect"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Day from './Day.vue';
import Arrow from './Arrow.vue';
import { CalendarEventCollection, type CalendarDate } from './models';

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

function next() {
  date.value = new Date(year.value, month.value + 1);
}

function prev() {
  date.value = new Date(year.value, month.value - 1);
}

function isToday(day: number): boolean {
  return (
    today.getFullYear() === year.value &&
    today.getMonth() === month.value &&
    today.getDate() === day
  );
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

  h1 {
    font-size: #{'min(5vw, 22.5px)'};
  }

  button {
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
    background: #e8e8e8;
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
