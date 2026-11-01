const AUTH_DB = 'firebaseLocalStorageDb';
const AUTH_STORE = 'firebaseLocalStorage';

type AuthRecord = { fbase_key: string; value?: { uid?: string } };

function withAuthStore<T>(
  win: Window,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = win.indexedDB.open(AUTH_DB);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const request = run(db.transaction(AUTH_STORE, mode).objectStore(AUTH_STORE));
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    };
  });
}

async function readStoredUid(win: Window): Promise<string | undefined> {
  const records = await withAuthStore<AuthRecord[]>(win, 'readonly', (store) => store.getAll());
  return records.find(({ fbase_key }) => fbase_key.startsWith('firebase:authUser:'))?.value?.uid;
}

async function pollForNewUid(win: Window, previous: string): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const uid = await readStoredUid(win);
    if (uid && uid !== previous) return uid;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Timed out waiting for a new anonymous user');
}

describe('Authentication', () => {
  it('signs in anonymously and returns to the requested page', () => {
    cy.visit('/polls');
    cy.location('pathname').should('eq', '/polls');
    cy.contains('label', 'Event Name:').should('be.visible');
  });

  it('preserves the full next url including the query string', () => {
    cy.visit('/login?nextUrl=%2Fpolls%3Fref%3Dtest');
    cy.location('pathname').should('eq', '/polls');
    cy.location('search').should('eq', '?ref=test');
  });

  it('falls back to home for protocol-relative redirects', () => {
    cy.visit('/login?nextUrl=//evil.example.com');
    cy.location('pathname').should('eq', '/');
    cy.location('hostname').should('eq', 'localhost');
    cy.contains('h1', 'Consensus');
  });

  it('signs in again and keeps voting if the session is lost mid-visit', () => {
    cy.createPoll('Lost session', 'Still works');
    cy.location('pathname').then((pathname) => {
      cy.window().then({ timeout: 15_000 }, async (win) => {
        const firstUid = await readStoredUid(win);
        expect(firstUid).to.be.a('string');
        // Firebase Auth polls IndexedDB to sync tabs, so removing the stored user signs this tab out.
        await withAuthStore(win, 'readwrite', (store) => store.clear());
        await pollForNewUid(win, firstUid!);
      });
      cy.location('pathname').should('eq', pathname);
    });

    cy.contains('h1', 'Lost session');
    cy.get('button[aria-label="Next month"]').click();
    cy.contains('.day-number', /^15$/).click();
    cy.get('.suggestions li').should('contain.text', '1 / 1');
  });

  it('falls back to home for absolute external redirects', () => {
    cy.visit('/login?nextUrl=https://evil.example.com');
    cy.location('pathname').should('eq', '/');
    cy.location('hostname').should('eq', 'localhost');
  });
});
