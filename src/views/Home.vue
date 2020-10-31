<template>
  <main>
    <div>
      <h1>Consensus</h1>
      <p>create, vote, share. no logins required</p>
      <Button :inverted="true" @click="handleClick">CREATE POLL</Button>
    </div>
  </main>
</template>

<script lang="ts">
import VueRouter from 'vue-router';
import { Component, Vue } from 'vue-property-decorator';
import Button from '@/components/Button.vue';

@Component({
  components: {
    Button,
  },
})
export default class Home extends Vue {
  private handleClick() {
    this.$router.push({ name: 'polls' })
      .catch((failure) => {
        if (!VueRouter.isNavigationFailure(failure, VueRouter.NavigationFailureType.redirected)) {
          throw failure;
        }
      });
  }
}
</script>

<style scoped lang="scss">
main {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--app-color, #CB89FF);
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
