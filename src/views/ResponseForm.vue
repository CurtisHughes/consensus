<template>
  <main>
    <h1>{{ poll.name }}</h1>
    <p>{{ poll.description }}</p>
    <DatePicker :collection="eventCollection" @select="toggleResponse" />
    <h2>Suggested Dates:</h2>
    <ul class="suggestions">
      <li v-for="{ date, count } in suggestions" :key="date.toLocaleDateString()">
        <p>{{ date.toLocaleDateString() }}</p>
        <p>{{ count }} / {{ authors.size }}</p>
      </li>
    </ul>
    <ShareTextButton :text="shareLinkText" />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import { CalendarEventCollection, type CalendarDate } from '@/components/DatePicker/models';
import ShareTextButton from '@/components/ShareTextButton.vue';
import database from '@/gateways/database';
import auth from '@/gateways/authentication';
import { logEvent } from '@/gateways/analytics';
import { useSyncStore } from '@/stores/sync';
import type { Poll, Response, Document, DateValue } from '@/models';

const route = useRoute();
const sync = useSyncStore();
const pollId = route.params.id as string;

const poll = ref({} as Document<Poll>);
const responses = ref<Document<Response<DateValue>>[]>([]);
const shareLinkText = window.location.href;

let unsubscribeFromPoll: Unsubscribe | undefined;
let unsubscribeFromResponses: Unsubscribe | undefined;

function handlePollSnapshot(document: DocumentSnapshot) {
  poll.value = {
    id: document.id,
    ...(document.data() as Poll),
  };
}

function handleResponsesSnapshot(snapshot: QuerySnapshot) {
  responses.value = snapshot.docs.map((response) => ({
    id: response.id,
    ...(response.data() as Response<DateValue>),
  }));
}

onMounted(() => {
  const pollRef = doc(database, 'polls', pollId);
  unsubscribeFromResponses = onSnapshot(collection(pollRef, 'responses'), handleResponsesSnapshot);
  unsubscribeFromPoll = onSnapshot(pollRef, handlePollSnapshot);
});

onBeforeUnmount(() => {
  unsubscribeFromPoll?.();
  unsubscribeFromResponses?.();
});

async function saveResponse(date: CalendarDate) {
  const uid = auth.currentUser?.uid;
  const responsesRef = collection(database, 'polls', pollId, 'responses');
  const existing = responses.value.find(
    ({ author, value: { day, month, year } }) =>
      author === uid && day === date.day && month === date.month && year === date.year,
  );
  try {
    if (existing) {
      await deleteDoc(doc(responsesRef, existing.id));
      logEvent('action', { name: 'delete_response', user: uid });
    } else {
      const response: Response<DateValue> = {
        author: uid ?? '',
        value: date,
      };
      await addDoc(responsesRef, response);
      logEvent('action', { name: 'create_response', user: uid });
    }
  } catch (err) {
    logEvent('error', { name: 'toggle_response', user: uid, error: err });
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

function toggleResponse(date: CalendarDate) {
  void sync.track(saveResponse(date));
}

const eventCollection = computed(() =>
  responses.value.reduce(
    (acc, { author, value }) => acc.add(value, { checked: auth.currentUser?.uid === author }),
    new CalendarEventCollection(),
  ),
);

const authors = computed(() => new Set(responses.value.map(({ author }) => author)));

const suggestions = computed(() =>
  Array.from(eventCollection.value, ({ events, date: { year, month, day } }) => ({
    date: new Date(year, month, day),
    count: events.length,
  }))
    .sort((a, b) => b.count - a.count || a.date.getTime() - b.date.getTime())
    .slice(0, 3),
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
