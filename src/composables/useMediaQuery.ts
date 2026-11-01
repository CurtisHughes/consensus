import { onBeforeUnmount, ref, type Ref } from 'vue';

export function useMediaQuery(query: string): Ref<boolean> {
  // jsdom (unit tests) does not implement matchMedia.
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(query) : undefined;
  const matches = ref(media?.matches ?? false);

  function onChange(event: MediaQueryListEvent) {
    matches.value = event.matches;
  }

  media?.addEventListener('change', onChange);
  onBeforeUnmount(() => media?.removeEventListener('change', onChange));

  return matches;
}
