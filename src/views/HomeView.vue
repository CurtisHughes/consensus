<template>
  <main>
    <div>
      <h1>Consensus</h1>
      <p>create, vote, share. no logins required</p>
      <BaseButton inverted @click="handleClick">CREATE POLL</BaseButton>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';

const router = useRouter();

function handleClick() {
  void router.push({ name: 'polls' });
}
</script>

<style scoped lang="scss">
main {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--app-color, #cb89ff);
  color: white;
  clip-path: polygon(0 0, 100% 0, 100% 50%, 0 90%);

  div {
    margin-bottom: 30vh;

    h1 {
      font-size: 36px;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 2em;
    }
  }
}
</style>
