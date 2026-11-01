import { computed, onScopeDispose, ref } from 'vue';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type DocumentSnapshot,
  type FirestoreError,
  type QuerySnapshot,
} from 'firebase/firestore';
import { CalendarEventCollection } from '@/components/DatePicker/models';
import database from '@/gateways/database';
import auth from '@/gateways/authentication';
import { logError, logEvent } from '@/gateways/analytics';
import { useSyncStore } from '@/stores/sync';
import { suggestDates } from '@/utils/suggestions';
import type { Poll, Response, Document, DateValue } from '@/models';

export type PollStatus = 'loading' | 'ready' | 'not-found' | 'error';

// Must match the response id format enforced in firestore.rules.
function responseId({ author, value: { year, month, day } }: Response<DateValue>) {
  return `${author}_${year}-${month}-${day}`;
}

export function usePoll(pollId: string) {
  const sync = useSyncStore();
  const pollRef = doc(database, 'polls', pollId);
  const responsesRef = collection(pollRef, 'responses');

  const status = ref<PollStatus>('loading');
  const saveFailed = ref(false);
  const poll = ref({} as Document<Poll>);
  const responses = ref<Document<Response<DateValue>>[]>([]);

  function handlePollSnapshot(document: DocumentSnapshot) {
    if (!document.exists()) {
      status.value = 'not-found';
      return;
    }
    poll.value = {
      id: document.id,
      ...(document.data() as Poll),
    };
    status.value = 'ready';
  }

  function handleResponsesSnapshot(snapshot: QuerySnapshot) {
    responses.value = snapshot.docs.map((response) => ({
      id: response.id,
      ...(response.data() as Response<DateValue>),
    }));
  }

  function handleSnapshotError(err: FirestoreError) {
    status.value = 'error';
    logError('load_poll', err);
  }

  const unsubscribeFromResponses = onSnapshot(
    responsesRef,
    handleResponsesSnapshot,
    handleSnapshotError,
  );
  const unsubscribeFromPoll = onSnapshot(pollRef, handlePollSnapshot, handleSnapshotError);

  onScopeDispose(() => {
    unsubscribeFromPoll();
    unsubscribeFromResponses();
  });

  async function saveResponse(date: DateValue) {
    const uid = auth.currentUser?.uid;
    const existing = responses.value.find(
      ({ author, value: { day, month, year } }) =>
        author === uid && day === date.day && month === date.month && year === date.year,
    );
    try {
      if (existing) {
        await deleteDoc(doc(responsesRef, existing.id));
        logEvent('action', { name: 'delete_response' });
      } else {
        const response: Response<DateValue> = {
          author: uid ?? '',
          value: date,
        };
        await setDoc(doc(responsesRef, responseId(response)), response);
        logEvent('action', { name: 'create_response' });
      }
      saveFailed.value = false;
    } catch (err) {
      saveFailed.value = true;
      logError('toggle_response', err);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  function toggleResponse(date: DateValue) {
    void sync.track(saveResponse(date));
  }

  const eventCollection = computed(() =>
    responses.value.reduce(
      (acc, { author, value }) => acc.add(value, { checked: auth.currentUser?.uid === author }),
      new CalendarEventCollection(),
    ),
  );

  const authors = computed(() => new Set(responses.value.map(({ author }) => author)));

  const suggestions = computed(() => suggestDates(responses.value));

  return {
    status,
    saveFailed,
    poll,
    responses,
    eventCollection,
    authors,
    suggestions,
    toggleResponse,
  };
}
