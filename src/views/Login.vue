<template>
  <main>
    <Spinner />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signInAnonymously } from 'firebase/auth';
import Spinner from '@/components/Spinner.vue';
import auth, { initialized } from '@/gateways/authentication';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  if ((await initialized) && !auth.currentUser) {
    await signInAnonymously(auth);
  }

  const { nextUrl } = route.query;
  await router.replace(typeof nextUrl === 'string' && nextUrl.startsWith('/') ? nextUrl : '/');
});
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
