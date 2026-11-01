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
      <p>{{ poll.description }}</p>
      <BaseAlert v-if="saveFailed" class="alert" role="alert">
        Whoops! Your vote wasn't saved. Please try again.
      </BaseAlert>
      <BaseAlert v-else-if="sync.slow" class="alert" role="status">
        Still saving. Check your internet connection.
      </BaseAlert>
      <DatePicker :collection="eventCollection" @select="toggleResponse" />
      <h2>Suggested Dates:</h2>
      <ul class="suggestions">
        <li v-for="{ date, count } in suggestions" :key="date.toLocaleDateString()">
          <p>{{ date.toLocaleDateString() }}</p>
          <p>{{ count }} / {{ authors.size }}</p>
        </li>
      </ul>
      <ShareTextButton :text="shareLinkText" />
    </template>
  </main>
</template>

<script setup lang="ts">
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

const { status, saveFailed, poll, eventCollection, authors, suggestions, toggleResponse } = usePoll(
  route.params.id as string,
);
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

  .status {
    display: flex;
    justify-content: center;
  }

  .alert {
    margin-bottom: 1rem;
  }
}

.suggestions {
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    list-style: none;

    p {
      color: var(--secondary-font-color, #2c3e508a);
      margin-top: 0;
    }
  }
}
</style>
