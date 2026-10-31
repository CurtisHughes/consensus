<template>
  <li :class="[{ checked }, 'day-container']">
    <div :class="[{ highlighted }, 'day']" @click="emit('select', day)">
      <p>{{ day }}</p>
      <DotGroup :count="events.length" :checked="checked" :limit="limit" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarEvent } from './models';
import DotGroup from './DotGroup.vue';

const props = withDefaults(
  defineProps<{
    day: number;
    highlighted?: boolean;
    events?: CalendarEvent[];
  }>(),
  {
    highlighted: false,
    events: () => [],
  },
);

const emit = defineEmits<{
  select: [day: number];
}>();

const limit = window.screen.width > 525 ? 4 : 3;

const checked = computed(() => props.events.some((event) => event.checked));
</script>

<style scoped lang="scss">
.day {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 15%;
  width: 70%;
  height: 70%;
  top: 0;

  p {
    margin: 0;
    flex-grow: 1;
  }
}

.day-container {
  cursor: pointer;
}

.day-container.checked {
  background: #bcbcbc;
}

.day.highlighted {
  color: var(--app-color, #cb89ff);
}
</style>
