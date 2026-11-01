import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const POLL_ID = 'poll';
const value = { year: 2026, month: 10, day: 15 };

let env: RulesTestEnvironment;

function db(uid: string) {
  return env.authenticatedContext(uid).firestore();
}

function responseDoc(uid: string, id: string, pollId = POLL_ID) {
  return doc(db(uid), 'polls', pollId, 'responses', id);
}

function participantDoc(uid: string, id: string, pollId = POLL_ID) {
  return doc(db(uid), 'polls', pollId, 'participants', id);
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-consensus',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'polls', POLL_ID), {
      name: 'Camping',
      description: '',
      author: 'owner',
    });
  });
});

describe('polls', () => {
  it('allows signed-in users to create a valid poll', async () => {
    await assertSucceeds(
      setDoc(doc(db('alice'), 'polls', 'new'), { name: 'Trip', description: '', author: 'alice' }),
    );
  });

  it('rejects polls with another author, an empty name, or extra fields', async () => {
    const pollRef = doc(db('alice'), 'polls', 'new');
    await assertFails(setDoc(pollRef, { name: 'Trip', description: '', author: 'bob' }));
    await assertFails(setDoc(pollRef, { name: '', description: '', author: 'alice' }));
    await assertFails(
      setDoc(pollRef, { name: 'Trip', description: '', author: 'alice', extra: true }),
    );
  });

  it('rejects unauthenticated reads', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'polls', POLL_ID)));
  });

  it('never allows polls to be edited', async () => {
    await assertFails(
      setDoc(doc(db('owner'), 'polls', POLL_ID), { name: 'X', description: '', author: 'owner' }),
    );
  });
});

describe('responses', () => {
  it('allows a response with the expected id', async () => {
    await assertSucceeds(
      setDoc(responseDoc('alice', 'alice_2026-10-15'), { author: 'alice', value }),
    );
  });

  it('rejects responses whose id does not match the author and date', async () => {
    await assertFails(setDoc(responseDoc('alice', 'random-id'), { author: 'alice', value }));
    await assertFails(setDoc(responseDoc('alice', 'alice_2026-10-16'), { author: 'alice', value }));
    await assertFails(setDoc(responseDoc('alice', 'bob_2026-10-15'), { author: 'bob', value }));
  });

  it('rejects a duplicate response for the same date', async () => {
    const ref = responseDoc('alice', 'alice_2026-10-15');
    await assertSucceeds(setDoc(ref, { author: 'alice', value }));
    await assertFails(setDoc(ref, { author: 'alice', value }));
  });

  it('rejects out-of-range months', async () => {
    const date = { ...value, month: 12 };
    await assertFails(
      setDoc(responseDoc('alice', 'alice_2026-12-15'), { author: 'alice', value: date }),
    );
  });

  it('rejects responses to a poll that does not exist', async () => {
    await assertFails(
      setDoc(responseDoc('alice', 'alice_2026-10-15', 'missing'), { author: 'alice', value }),
    );
  });

  it('only lets authors delete their own responses', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'polls', POLL_ID, 'responses', 'alice_2026-10-15'), {
        author: 'alice',
        value,
      });
    });
    await assertFails(deleteDoc(responseDoc('bob', 'alice_2026-10-15')));
    await assertSucceeds(deleteDoc(responseDoc('alice', 'alice_2026-10-15')));
  });
});

describe('participants', () => {
  it('allows users to set and rename their own name', async () => {
    const ref = participantDoc('alice', 'alice');
    await assertSucceeds(setDoc(ref, { name: 'Alice' }));
    await assertSucceeds(setDoc(ref, { name: 'Ali' }));
    await assertSucceeds(getDocs(collection(db('bob'), 'polls', POLL_ID, 'participants')));
  });

  it("rejects setting someone else's name", async () => {
    await assertFails(setDoc(participantDoc('alice', 'bob'), { name: 'Bob' }));
  });

  it('rejects empty, overlong, or non-string names and extra fields', async () => {
    const ref = participantDoc('alice', 'alice');
    await assertFails(setDoc(ref, { name: '' }));
    await assertFails(setDoc(ref, { name: 'a'.repeat(51) }));
    await assertFails(setDoc(ref, { name: 42 }));
    await assertFails(setDoc(ref, { name: 'Alice', extra: true }));
  });

  it('rejects names for a poll that does not exist', async () => {
    await assertFails(setDoc(participantDoc('alice', 'alice', 'missing'), { name: 'Alice' }));
  });

  it('never allows names to be deleted', async () => {
    const ref = participantDoc('alice', 'alice');
    await assertSucceeds(setDoc(ref, { name: 'Alice' }));
    await assertFails(deleteDoc(ref));
  });

  it('rejects unauthenticated reads', async () => {
    await assertFails(
      getDocs(
        collection(env.unauthenticatedContext().firestore(), 'polls', POLL_ID, 'participants'),
      ),
    );
  });
});
