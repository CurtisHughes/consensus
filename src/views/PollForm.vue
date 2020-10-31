<template>
  <main>
    <Alert v-if="error" class="alert">Whoops! Something went wrong.</Alert>
    <form @submit.prevent="handleSubmit" :style="{ opacity: (loading) ? '65%' : '100%' }">
      <label for="event">Event Name:</label>
      <TextInput
        v-model="name"
        :disabled="loading"
        required
        name="event"
        placeholder="Camping 2020"
      />

      <label for="description">Description:</label>
      <Textarea
        v-model="description"
        required
        :disabled="loading"
        name="description"
        cols="30"
        rows="5"
        placeholder="Let's go to outside!"
      />

      <Button type="submit" :disabled="loading">
        CREATE
      </Button>
    </form>
    <span class="overlay" v-if="loading">
      <Spinner />
    </span>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Textarea from '@/components/Textarea.vue';
import Spinner from '@/components/Spinner.vue';
import Alert from '@/components/Alert.vue';
import database from '@/gateways/database';
import auth from '@/gateways/authentication';
import analytics from '@/gateways/analytics';
import { Poll } from '@/models';

@Component({
  components: {
    Alert,
    Button,
    TextInput,
    Textarea,
    Spinner,
  },
})
export default class PollForm extends Vue {
  private name = '';

  private description = '';

  private error = false;

  private loading = false;

  private async handleSubmit() {
    try {
      this.loading = true;
      const poll: Poll = {
        name: this.name,
        description: this.description,
        author: auth.currentUser ? auth.currentUser.uid : '',
      };
      const { id } = await database.collection('polls').add(poll);
      analytics.logEvent('action', { name: 'create_poll', user: auth.currentUser?.uid });
      this.$router.push({
        name: 'polls-id',
        params: { id },
      });
    } catch (err) {
      this.loading = false;
      this.error = true;
      analytics.logEvent('error', { name: 'create_poll', user: auth.currentUser?.uid, error: err });
    }
  }
}
</script>

<style scoped lang="scss">
main {
  position: relative;

  .alert {
    margin-bottom: 1rem;
  }

  .overlay {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: 1;
  }

  form {
    display: grid;
    grid-row-gap: 8px;
    align-items: center;
    justify-content: center;

    button[type="submit"] {
      justify-self: right;
    }
  }
}
</style>
