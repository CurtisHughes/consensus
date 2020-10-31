<template>
  <main>
    <Spinner />
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Spinner from '@/components/Spinner.vue';
import auth, { initialized } from '@/gateways/authentication';

@Component({
  components: {
    Spinner,
  },
})
export default class Login extends Vue {
  public async mounted() {
    if ((await initialized) && !auth.currentUser) {
      await auth.signInAnonymously();
    }

    return this.$route.params.nextUrl !== null
      ? this.$router.replace(this.$route.params.nextUrl)
      : this.$router.replace('/');
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
