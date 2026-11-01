<template>
  <main>
    <div v-if="status === 'loading'" class="status">
      <BaseSpinner />
    </div>
    <BaseAlert v-else-if="status === 'not-found'" role="alert">
      We couldn't find that poll. Check the link and try again.
    </BaseAlert>
    <BaseAlert v-else-if="status === 'error'" role="alert">
      Whoops! Something went wrong loading this poll.
    </BaseAlert>
    <template v-else>
      <h1>{{ poll.name }}</h1>
      <p v-if="poll.description" class="description">{{ poll.description }}</p>

      <section class="invite">
        <h2 class="label">Invite others</h2>
        <ShareTextButton :text="shareLinkText" :title="poll.name" />
      </section>

      <BaseAlert v-if="saveFailed" class="alert" role="alert">
        Whoops! Your vote wasn't saved. Please try again.
      </BaseAlert>
      <BaseAlert v-else-if="sync.slow" class="alert" role="status">
        Still saving. Check your internet connection.
      </BaseAlert>
      <p class="hint">Tap the days you're free. Tap again to remove.</p>
      <DatePicker ref="picker" :collection="eventCollection" @select="toggleResponse" />

      <h2>Suggested Dates:</h2>
      <p v-if="suggestions.length === 0" class="empty">
        No votes yet. Be the first to pick a date!
      </p>
      <TransitionGroup v-else tag="ul" name="suggestion" class="suggestions">
        <li
          v-for="({ date, count }, index) in suggestions"
          :key="date.getTime()"
          :class="{ best: index === 0 }"
        >
          <button type="button" :title="`Show ${formatMonth(date)}`" @click="picker?.show(date)">
            <span class="date">
              {{ formatDate(date) }}
              <span v-if="index === 0" class="badge">Best date</span>
            </span>
            <span class="count">{{ count }} / {{ authors.size }}</span>
            <span class="bar" aria-hidden="true">
              <span class="fill" :style="{ width: `${(count / authors.size) * 100}%` }" />
            </span>
          </button>
        </li>
      </TransitionGroup>
    </template>
  </main>
</template>

<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import ShareTextButton from '@/components/ShareTextButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { usePoll } from '@/composables/usePoll';
import { useSyncStore } from '@/stores/sync';

const route = useRoute();
const sync = useSyncStore();
const shareLinkText = window.location.href;
const picker = useTemplateRef('picker');

const { status, saveFailed, poll, eventCollection, authors, suggestions, toggleResponse } = usePoll(
  route.params.id as string,
);

watch(
  () => poll.value.name,
  (name) => {
    if (name) document.title = `${name} · Consensus`;
  },
);

function formatDate(date: Date): string {
  return date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
}
</script>

<style scoped lang="scss">
main {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 30px;

  p {
    color: var(--secondary-font-color, #2c3e508a);
  }

  .description {
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  .status {
    display: flex;
    justify-content: center;
  }

  .alert {
    margin-bottom: 1rem;
  }

  .invite {
    margin: 1.5rem 0;

    .label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--secondary-font-color, #2c3e508a);
      margin: 0 0 0.5rem;
    }
  }

  .hint {
    margin-bottom: 0;
  }
}

.suggestions {
  display: grid;
  gap: 8px;
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

  .best {
    button {
      border-color: var(--app-color, #ff8a8a);
    }

    .fill {
      background: var(--app-color, #ff8a8a);
    }
  }
}
</style>
