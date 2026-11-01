<template>
  <header>
    <h3>
      <router-link :to="{ name: 'home' }">Consensus</router-link>
    </h3>
    <BaseSpinner v-if="sync.syncing" class="spinner" />
    <div v-else class="circle"></div>
  </header>
</template>

<script setup lang="ts">
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useSyncStore } from '@/stores/sync';

const sync = useSyncStore();
</script>

<style scoped lang="scss">
@keyframes grow {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

header {
  position: fixed;
  height: 60px;
  width: 100vw;
  top: 0;
  display: grid;
  background: white;
  grid-template-columns: 1fr auto;
  align-items: center;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  z-index: 100;

  h3 {
    margin: auto;
    margin-left: 30px;

    a {
      color: inherit;
      text-decoration: none;
    }
  }

  .spinner {
    width: 14px;
    height: 14px;
    margin-right: 30px;
    margin-left: 30px;
    border: 3px solid;
  }

  .circle {
    background: var(--app-color, #ff8a8a);
    width: 20px;
    height: 20px;
    margin-right: 30px;
    margin-left: 30px;
    border-radius: 50%;
    animation: grow 0.25s cubic-bezier(0, 0, 0, 2);
  }
}
</style>
