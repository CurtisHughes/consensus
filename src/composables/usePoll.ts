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
import type { Poll, Response, Document, DateValue, Participant } from '@/models';

export type PollStatus = 'loading' | 'ready' | 'not-found' | 'error';

const REMEMBERED_NAME_KEY = 'consensus:display-name';

// Must match the response id format enforced in firestore.rules.
function responseId({ author, value: { year, month, day } }: Response<DateValue>) {
  return `${author}_${year}-${month}-${day}`;
}

function readRememberedName(): string {
  try {
    return localStorage.getItem(REMEMBERED_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function rememberName(name: string) {
  try {
    localStorage.setItem(REMEMBERED_NAME_KEY, name);
  } catch {
    // Storage can be unavailable (e.g. blocked cookies); the name just won't pre-fill next time.
  }
}

function currentUid(): string {
  return auth.currentUser?.uid ?? '';
}

export function usePoll(pollId: string) {
  const sync = useSyncStore();
  const pollRef = doc(database, 'polls', pollId);
  const responsesRef = collection(pollRef, 'responses');
  const participantsRef = collection(pollRef, 'participants');

  const status = ref<PollStatus>('loading');
  const saveFailed = ref(false);
  const poll = ref({} as Document<Poll>);
  const responses = ref<Document<Response<DateValue>>[]>([]);
  const responsesLoaded = ref(false);
  const participants = ref(new Map<string, string>());
  const participantsLoaded = ref(false);
  const rememberedName = readRememberedName();

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
    responsesLoaded.value = true;
  }

  function handleParticipantsSnapshot(snapshot: QuerySnapshot) {
    participants.value = new Map(
      snapshot.docs.map((participant) => [
        participant.id,
        (participant.data() as Participant).name,
      ]),
    );
    participantsLoaded.value = true;
  }

  function handleSnapshotError(err: FirestoreError) {
    status.value = 'error';
    logError('load_poll', err);
  }

  // Names are optional, so failing to load them shouldn't take down the whole poll.
  function handleParticipantsError(err: FirestoreError) {
    logError('load_participants', err);
  }

  const unsubscribeFromResponses = onSnapshot(
    responsesRef,
    handleResponsesSnapshot,
    handleSnapshotError,
  );
  const unsubscribeFromParticipants = onSnapshot(
    participantsRef,
    handleParticipantsSnapshot,
    handleParticipantsError,
  );
  const unsubscribeFromPoll = onSnapshot(pollRef, handlePollSnapshot, handleSnapshotError);

  onScopeDispose(() => {
    unsubscribeFromPoll();
    unsubscribeFromResponses();
    unsubscribeFromParticipants();
  });

  const myName = computed(() => participants.value.get(currentUid()) ?? '');

  async function writeName(name: string) {
    await setDoc(doc(participantsRef, currentUid()), { name } satisfies Participant);
  }

  async function saveName(name: string): Promise<boolean> {
    const trimmed = name.trim();
    if (!trimmed) return false;
    rememberName(trimmed);
    try {
      await sync.track(writeName(trimmed));
      logEvent('action', { name: 'set_name' });
      return true;
    } catch (err) {
      logError('set_name', err);
      return false;
    }
  }

  async function saveResponse(date: DateValue) {
    const uid = currentUid();
    const existing = responses.value.find(
      ({ author, value: { day, month, year } }) =>
        author === uid && day === date.day && month === date.month && year === date.year,
    );
    try {
      if (existing) {
        await deleteDoc(doc(responsesRef, existing.id));
        logEvent('action', { name: 'delete_response' });
      } else {
        if (participantsLoaded.value && !myName.value && rememberedName) {
          void sync.track(writeName(rememberedName)).catch((err) => logError('set_name', err));
        }
        const response: Response<DateValue> = {
          author: uid,
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
      (acc, { author, value }) => acc.add(value, { checked: currentUid() === author }),
      new CalendarEventCollection(),
    ),
  );

  const authors = computed(() => new Set(responses.value.map(({ author }) => author)));

  /** Everyone who has voted or added their name. */
  const people = computed(() => new Set([...authors.value, ...participants.value.keys()]));

  const suggestions = computed(() => suggestDates(responses.value, { limit: Infinity }));

  const myPicks = computed(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const uid = currentUid();
    return responses.value
      .filter(({ author }) => author === uid)
      .map(({ value: { year, month, day } }) => new Date(year, month, day))
      .filter((date) => date >= startOfToday)
      .sort((a, b) => a.getTime() - b.getTime());
  });

  return {
    uid: currentUid(),
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
    authors,
    people,
    suggestions,
    myPicks,
    toggleResponse,
  };
}
