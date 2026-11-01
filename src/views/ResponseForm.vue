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
      <p v-if="people.size > 0" class="responded">
        {{ people.size }} {{ people.size === 1 ? 'person has' : 'people have' }} responded
      </p>

      <section v-if="inviteFirst" class="invite">
        <h2 class="label">Share this link to get started</h2>
        <ShareTextButton :text="shareLinkText" :title="poll.name" />
      </section>

      <ParticipantName :name="myName" :suggestion="rememberedName" :save="saveName" />

      <section class="availability" aria-labelledby="availability-heading">
        <h2 id="availability-heading">When are you free?</h2>
        <BaseAlert v-if="saveFailed" class="alert" role="alert">
          Whoops! Your vote wasn't saved. Please try again.
        </BaseAlert>
        <BaseAlert v-else-if="sync.slow" class="alert" role="status">
          Still saving. Check your internet connection.
        </BaseAlert>
        <DatePicker ref="picker" :collection="eventCollection" @select="toggleResponse" />
      </section>

      <MyPicks
        :picks="myPicks"
        :saving="sync.syncing"
        :failed="saveFailed"
        @show="picker?.show($event)"
        @remove="removePick"
      />

      <PollResults
        :suggestions="suggestions"
        :total="people.size"
        :participants="participants"
        :uid="uid"
        @show="picker?.show($event)"
      />

      <section v-if="!inviteFirst" class="invite compact">
        <h2 class="label">Know someone else who's coming? Share this poll</h2>
        <ShareTextButton :text="shareLinkText" :title="poll.name" />
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import ShareTextButton from '@/components/ShareTextButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import MyPicks from '@/components/MyPicks.vue';
import PollResults from '@/components/PollResults.vue';
import ParticipantName from '@/components/ParticipantName.vue';
import { usePoll } from '@/composables/usePoll';
import { useSyncStore } from '@/stores/sync';

const route = useRoute();
const sync = useSyncStore();
const shareLinkText = window.location.href;
const picker = useTemplateRef('picker');

const {
  uid,
  status,
  saveFailed,
  poll,
  responses,
  responsesLoaded,
  participants,
  myName,
  rememberedName,
  saveName,
  eventCollection,
  people,
  suggestions,
  myPicks,
  toggleResponse,
} = usePoll(route.params.id as string);

const inviteFirst = computed(
  () => poll.value.author === uid && responsesLoaded.value && responses.value.length === 0,
);

watch(
  () => poll.value.name,
  (name) => {
    if (name) document.title = `${name} · Consensus`;
  },
);

// Open on the best date's month if nobody has voted for anything this month.
const stopOpeningBestMonth = watch(
  () => status.value === 'ready' && responsesLoaded.value && picker.value !== null,
  (loaded) => {
    if (!loaded) return;
    stopOpeningBestMonth();
    const now = new Date();
    const votedThisMonth = suggestions.value.some(
      ({ date }) => date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(),
    );
    const best = suggestions.value[0];
    if (!votedThisMonth && best) picker.value?.show(best.date);
  },
  { flush: 'post' },
);

function removePick(date: Date) {
  toggleResponse({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate() });
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

  .responded {
    font-size: 14px;
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

    &.compact {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color, #00000033);

      .label {
        text-transform: none;
        letter-spacing: normal;
        font-weight: normal;
      }
    }
  }

  .availability {
    margin: 1.5rem 0;

    h2 {
      margin: 0 0 0.5rem;
      font-size: 18px;
    }
  }
}
</style>
