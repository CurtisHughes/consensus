<template>
  <li :class="[{ checked }, 'day-container']">
    <button
      type="button"
      :class="[{ highlighted }, 'day']"
      :disabled="disabled"
      :aria-pressed="checked"
      :aria-label="ariaLabel"
      @click="emit('select', day)"
    >
      <span class="day-number">{{ day }}</span>
      <DotGroup :count="events.length" :checked="checked" :limit="limit" />
    </button>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarEvent } from './models';
import DotGroup from './DotGroup.vue';

const props = withDefaults(
  defineProps<{
    day: number;
    label?: string;
    highlighted?: boolean;
    disabled?: boolean;
    events?: CalendarEvent[];
    limit?: number;
  }>(),
  {
    label: undefined,
    highlighted: false,
    disabled: false,
    limit: 4,
    events: () => [],
  },
);

const emit = defineEmits<{
  select: [day: number];
}>();

const checked = computed(() => props.events.some((event) => event.checked));

const ariaLabel = computed(() => {
  const count = props.events.length;
  return `${props.label ?? props.day}, ${count} ${count === 1 ? 'vote' : 'votes'}`;
});
</script>

<style scoped lang="scss">
.day {
  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 15%;
  width: 100%;
  height: 100%;
  top: 0;
  margin: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--app-color, #cb89ff);
    outline-offset: -2px;
  }

  .day-number {
    flex-grow: 1;
  }
}

.day-container.checked {
  background: #bcbcbc;
}

.day.highlighted {
  color: var(--app-color, #cb89ff);
}
</style>
