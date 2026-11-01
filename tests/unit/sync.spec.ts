import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { SLOW_SYNC_MS, useSyncStore } from '@/stores/sync';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

describe('sync store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is syncing while a tracked promise is pending', async () => {
    const sync = useSyncStore();
    const write = deferred();
    const tracked = sync.track(write.promise);
    expect(sync.syncing).toBe(true);

    write.resolve();
    await tracked;
    expect(sync.syncing).toBe(false);
  });

  it('reports slow saves only after the threshold', async () => {
    const sync = useSyncStore();
    const write = deferred();
    const tracked = sync.track(write.promise);

    vi.advanceTimersByTime(SLOW_SYNC_MS - 1);
    expect(sync.slow).toBe(false);
    vi.advanceTimersByTime(1);
    expect(sync.slow).toBe(true);

    write.resolve();
    await tracked;
    expect(sync.slow).toBe(false);
  });

  it('clears the slow flag when a slow save fails', async () => {
    const sync = useSyncStore();
    const tracked = sync.track(
      new Promise((_, reject) => setTimeout(() => reject(new Error('offline')), SLOW_SYNC_MS * 2)),
    );

    vi.advanceTimersByTime(SLOW_SYNC_MS);
    expect(sync.slow).toBe(true);
    vi.advanceTimersByTime(SLOW_SYNC_MS);
    await expect(tracked).rejects.toThrow('offline');
    expect(sync.slow).toBe(false);
    expect(sync.syncing).toBe(false);
  });
});
