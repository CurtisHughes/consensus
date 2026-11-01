<template>
  <div
    role="gridcell"
    :class="[
      { checked, heated: heat > 0, past: disabled, 'is-today': highlighted },
      'day-container',
    ]"
    :style="heatStyle"
  >
    <button
      type="button"
      :class="[{ highlighted }, 'day']"
      :disabled="disabled"
      :tabindex="focusable ? 0 : -1"
      :aria-pressed="checked"
      :aria-label="ariaLabel"
      @click="emit('select', day)"
      @focus="emit('focus', day)"
    >
      <span class="day-number">{{ day }}</span>
      <span v-if="checked" class="pick-dot" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarEvent } from './models';

const props = withDefaults(
  defineProps<{
    day: number;
    label?: string;
    highlighted?: boolean;
    disabled?: boolean;
    focusable?: boolean;
    events?: CalendarEvent[];
    max?: number;
  }>(),
  {
    label: undefined,
    highlighted: false,
    disabled: false,
    focusable: false,
    events: () => [],
    max: 0,
  },
);

const emit = defineEmits<{
  select: [day: number];
  focus: [day: number];
}>();

const MIN_HEAT = 20;
const MAX_HEAT = 75;

const checked = computed(() => props.events.some((event) => event.checked));

const heat = computed(() => {
  const count = props.events.length;
  if (count === 0 || props.max === 0 || props.disabled) return 0;
  return Math.round(MIN_HEAT + ((MAX_HEAT - MIN_HEAT) * count) / props.max);
});

const heatStyle = computed(() =>
  heat.value === 0
    ? undefined
    : {
        background: `color-mix(in srgb, var(--app-color, #ff8a8a) ${heat.value}%, var(--surface-color, #e8e8e8))`,
      },
);

const ariaLabel = computed(() => {
  const count = props.events.length;
  const parts = [props.label ?? String(props.day)];
  if (props.highlighted) parts.push('today');
  parts.push(`${count} ${count === 1 ? 'vote' : 'votes'}`);
  return parts.join(', ');
});
</script>

<style scoped lang="scss">
.day-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius, 5px);
  background: var(--surface-color, #e8e8e8);
  transition:
    background 0.2s,
    transform 0.1s;

  &.past {
    background: none;
  }

  &.is-today {
    box-shadow: inset 0 0 0 2px var(--primary-font-color, #2c3e50);

    .day-number {
      font-weight: bold;
    }
  }

  &:has(.day:not(:disabled):active) {
    transform: scale(0.94);
  }
}

.day {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0 0 0.35em;
  border: none;
  border-radius: inherit;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s;

  @media (hover: hover) {
    &:not(:disabled):hover {
      background: color-mix(in srgb, var(--primary-font-color, #2c3e50) 8%, transparent);
    }
  }

  &:disabled {
    color: var(--secondary-font-color, #2c3e508a);
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-font-color, #2c3e50);
    outline-offset: 2px;
  }

  .day-number {
    line-height: 1;
  }

  .pick-dot {
    position: absolute;
    top: calc(50% + 0.6em);
    left: 50%;
    width: 0.35em;
    height: 0.35em;
    margin-left: -0.175em;
    border-radius: 50%;
    background: currentColor;
    animation: pick 0.25s ease-out;
  }
}

@keyframes pick {
  from {
    transform: scale(0);
  }
}
</style>
