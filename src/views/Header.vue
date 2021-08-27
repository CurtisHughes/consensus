<template>
  <header>
    <h3 @click="$router.push({ name: 'home' })">Consensus</h3>
    <Spinner v-if="$store.state.syncing" class="spinner" />
    <div v-else class="circle"></div>
  </header>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Spinner from '@/components/Spinner.vue';

@Component({
  components: {
    Spinner,
  },
})
export default class Header extends Vue {
}
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
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, .15);

  h3 {
    margin-left: 30px;
  }

  .spinner {
    width: 14px;
    height: 14px;
    margin-right: 30px;
    margin-left: 30px;
    border: 3px solid;
  }

  .circle {
    background: var(--app-color, #CB89FF);
    width: 20px;
    height: 20px;
    margin-right: 30px;
    margin-left: 30px;
    border-radius: 50%;
    animation: grow .25s cubic-bezier(0, 0, 0, 2);
  }
}
</style>
