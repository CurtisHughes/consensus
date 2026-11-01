<template>
  <section class="my-picks" aria-labelledby="my-picks-heading">
    <div class="heading">
      <h2 id="my-picks-heading">{{ heading }}</h2>
      <span class="save-status" :class="{ saved: !saving && justSaved }" role="status">
        {{ statusText }}
      </span>
    </div>
    <p v-if="picks.length === 0" class="empty">Tap days on the calendar to add them.</p>
    <TransitionGroup v-else tag="ul" name="chip" class="chips">
      <li v-for="date in picks" :key="date.getTime()" class="chip">
        <button
          type="button"
          class="label"
          :title="`Show ${formatMonth(date)}`"
          @click="emit('show', date)"
        >
          {{ formatDate(date) }}
        </button>
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${formatDate(date)}`"
          @click="emit('remove', date)"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
          </svg>
        </button>
      </li>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { formatDate, formatMonth } from '@/utils/format';

const SAVED_MS = 2000;

const props = withDefaults(
  defineProps<{
    picks: Date[];
    saving?: boolean;
    failed?: boolean;
  }>(),
  {
    saving: false,
    failed: false,
  },
);

const emit = defineEmits<{
  show: [date: Date];
  remove: [date: Date];
}>();

const justSaved = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.saving,
  (saving, wasSaving) => {
    clearTimeout(timer);
    justSaved.value = false;
    if (saving || !wasSaving || props.failed) return;
    justSaved.value = true;
    timer = setTimeout(() => (justSaved.value = false), SAVED_MS);
  },
);

onBeforeUnmount(() => clearTimeout(timer));

const heading = computed(() => {
  const count = props.picks.length;
  if (count === 0) return 'Your picks';
  return `You picked ${count} ${count === 1 ? 'day' : 'days'}`;
});

const statusText = computed(() => {
  if (props.saving) return 'Saving…';
  return justSaved.value ? 'Saved' : '';
});
</script>

<style scoped lang="scss">
.my-picks {
  margin: 1.5rem 0;
}

.heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 18px;
  }
}

.save-status {
  font-size: 14px;
  color: var(--secondary-font-color, #2c3e508a);

  &.saved {
    color: #2e9e5b;
  }
}

.empty {
  margin: 0;
  color: var(--secondary-font-color, #2c3e508a);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
}

.chip {
  display: flex;
  align-items: stretch;
  list-style: none;
  border: 1px solid var(--border-color, #00000033);
  border-radius: 999px;
  overflow: hidden;

  button {
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: var(--surface-color, #e8e8e8);
    }

    &:focus-visible {
      outline: 2px solid var(--app-color, #ff8a8a);
      outline-offset: -2px;
    }
  }

  .label {
    padding: 4px 4px 4px 12px;
  }

  .remove {
    display: flex;
    align-items: center;
    padding: 0 10px 0 6px;

    svg {
      width: 12px;
      height: 12px;
    }

    path {
      stroke: var(--secondary-font-color, #2c3e508a);
      stroke-width: 1.6;
      stroke-linecap: round;
    }
  }
}

.chip-enter-active,
.chip-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
