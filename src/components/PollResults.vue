<template>
  <section class="results" aria-labelledby="results-heading">
    <h2 id="results-heading">Results</h2>
    <p v-if="suggestions.length === 0" class="empty">No votes yet. Be the first to pick a date!</p>
    <template v-else>
      <TransitionGroup tag="ul" name="suggestion" class="suggestions">
        <li
          v-for="{ date, count, authors } in visible"
          :key="date.getTime()"
          :class="{ best: count === topCount, mine: authors.includes(uid) }"
        >
          <button type="button" :title="`Show ${formatMonth(date)}`" @click="emit('show', date)">
            <span class="date">
              {{ formatDate(date) }}
              <span v-if="count === topCount" class="badge">
                {{ tied ? 'Tied for best' : 'Best date' }}
              </span>
            </span>
            <span class="count">{{ count }} / {{ total }}</span>
            <span class="bar" aria-hidden="true">
              <span class="fill" :style="{ width: `${(count / total) * 100}%` }" />
            </span>
            <span class="voters">{{ formatVoters(authors, participants, uid) }}</span>
          </button>
        </li>
      </TransitionGroup>
      <button
        v-if="suggestions.length > COLLAPSED_COUNT"
        type="button"
        class="toggle"
        :aria-expanded="showAll"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Show fewer' : `Show all ${suggestions.length} dates` }}
      </button>
    </template>
    <p v-if="waitingOn.length > 0" class="waiting">Waiting on: {{ waitingOn.join(', ') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Suggestion } from '@/utils/suggestions';
import { formatDate, formatMonth } from '@/utils/format';
import { formatVoters } from '@/utils/voters';

const COLLAPSED_COUNT = 3;

const props = defineProps<{
  suggestions: Suggestion[];
  total: number;
  participants: Map<string, string>;
  uid: string;
}>();

const emit = defineEmits<{
  show: [date: Date];
}>();

const showAll = ref(false);

const visible = computed(() =>
  showAll.value ? props.suggestions : props.suggestions.slice(0, COLLAPSED_COUNT),
);

const topCount = computed(() => props.suggestions[0]?.count ?? 0);

const tied = computed(
  () => props.suggestions.filter(({ count }) => count === topCount.value).length > 1,
);

/** Named participants, other than you, who haven't picked any upcoming dates. */
const waitingOn = computed(() => {
  const voted = new Set(props.suggestions.flatMap(({ authors }) => authors));
  return Array.from(props.participants)
    .filter(([id]) => id !== props.uid && !voted.has(id))
    .map(([, name]) => name);
});
</script>

<style scoped lang="scss">
.results {
  margin: 1.5rem 0;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 18px;
  }
}

.empty,
.waiting {
  color: var(--secondary-font-color, #2c3e508a);
}

.waiting {
  margin-bottom: 0;
  font-size: 14px;
}

.suggestions {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;

  li {
    list-style: none;
  }

  .suggestion-move {
    transition: transform 0.35s ease;
  }

  .suggestion-enter-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .suggestion-enter-from {
    opacity: 0;
    transform: translateY(-8px);
  }

  button {
    display: grid;
    grid-template-columns: 1fr auto;
    row-gap: 6px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color, #00000033);
    border-radius: var(--radius, 5px);
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: var(--surface-color, #e8e8e8);
    }

    &:focus-visible {
      outline: 2px solid var(--app-color, #ff8a8a);
      outline-offset: 2px;
    }
  }

  .count {
    color: var(--secondary-font-color, #2c3e508a);
  }

  .badge {
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--app-color, #ff8a8a);
    color: white;
    font-size: 12px;
    vertical-align: middle;
  }

  .bar {
    grid-column: 1 / -1;
    height: 4px;
    border-radius: 2px;
    background: var(--surface-color, #e8e8e8);
    overflow: hidden;
  }

  .fill {
    display: block;
    height: 100%;
    background: var(--secondary-font-color, #2c3e508a);
    transition: width 0.3s ease;
  }

  .voters {
    grid-column: 1 / -1;
    font-size: 13px;
    color: var(--secondary-font-color, #2c3e508a);
    overflow-wrap: anywhere;
  }

  .best {
    button {
      border-color: var(--app-color, #ff8a8a);
    }

    .fill {
      background: var(--app-color, #ff8a8a);
    }
  }
}

.toggle {
  margin-top: 8px;
  padding: 4px 0;
  border: none;
  background: none;
  color: var(--primary-font-color, #2c3e50);
  font: inherit;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--app-color, #ff8a8a);
    outline-offset: 2px;
  }
}
</style>
