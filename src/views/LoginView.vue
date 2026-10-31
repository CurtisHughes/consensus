<template>
  <main>
    <BaseSpinner />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signInAnonymously } from 'firebase/auth';
import BaseSpinner from '@/components/BaseSpinner.vue';
import auth, { initialized } from '@/gateways/authentication';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  if ((await initialized) && !auth.currentUser) {
    await signInAnonymously(auth);
  }

  const { nextUrl } = route.query;
  await router.replace(getSafeRedirect(nextUrl));
});

function getSafeRedirect(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/';
  // Reject protocol-relative URLs, backslashes, and control characters.
  if (value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return '/';
  try {
    const resolved = new URL(value, window.location.origin);
    if (resolved.origin !== window.location.origin) return '/';
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return '/';
  }
}
</script>

<style scoped lang="scss">
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
</style>
