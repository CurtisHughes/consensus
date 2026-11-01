import { defineStore } from 'pinia';

// Firestore writes wait for the server indefinitely (e.g. while offline), so after this long we
// tell the user instead of spinning silently.
export const SLOW_SYNC_MS = 15_000;

export const useSyncStore = defineStore('sync', {
  state: () => ({
    count: 0,
    slowCount: 0,
  }),
  getters: {
    syncing: (state) => state.count > 0,
    slow: (state) => state.slowCount > 0,
  },
  actions: {
    async track<T>(syncing: Promise<T>): Promise<T> {
      this.count += 1;
      let slow = false;
      const timer = setTimeout(() => {
        slow = true;
        this.slowCount += 1;
      }, SLOW_SYNC_MS);
      try {
        return await syncing;
      } finally {
        clearTimeout(timer);
        if (slow) this.slowCount -= 1;
        this.count -= 1;
      }
    },
  },
});
