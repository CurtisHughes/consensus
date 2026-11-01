import { defineStore } from 'pinia';

export const useSyncStore = defineStore('sync', {
  state: () => ({
    count: 0,
  }),
  getters: {
    syncing: (state) => state.count > 0,
  },
  actions: {
    async track<T>(syncing: Promise<T>): Promise<T> {
      this.count += 1;
      try {
        return await syncing;
      } finally {
        this.count -= 1;
      }
    },
  },
});
