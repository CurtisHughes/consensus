<template>
  <main>
    <BaseAlert v-if="error" class="alert" role="alert">Whoops! Something went wrong.</BaseAlert>
    <BaseAlert v-else-if="sync.slow" class="alert" role="status">
      Still saving. Check your internet connection.
    </BaseAlert>
    <form :style="{ opacity: loading ? '65%' : '100%' }" @submit.prevent="handleSubmit">
      <label for="event">Event Name:</label>
      <TextInput
        id="event"
        v-model="name"
        :disabled="loading"
        required
        maxlength="200"
        name="event"
        placeholder="Camping trip"
      />

      <label for="description">Description:</label>
      <TextArea
        id="description"
        v-model="description"
        required
        maxlength="2000"
        :disabled="loading"
        name="description"
        cols="30"
        rows="5"
        placeholder="Let's go outside!"
      />

      <BaseButton type="submit" :disabled="loading"> CREATE </BaseButton>
    </form>
    <span v-if="loading" class="overlay">
      <BaseSpinner />
    </span>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addDoc, collection } from 'firebase/firestore';
import BaseButton from '@/components/BaseButton.vue';
import TextInput from '@/components/TextInput.vue';
import TextArea from '@/components/TextArea.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import database from '@/gateways/database';
import auth from '@/gateways/authentication';
import { logError, logEvent } from '@/gateways/analytics';
import { useSyncStore } from '@/stores/sync';
import type { Poll } from '@/models';

const router = useRouter();
const sync = useSyncStore();

const name = ref('');
const description = ref('');
const error = ref(false);
const loading = ref(false);

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = false;
    const poll: Poll = {
      name: name.value,
      description: description.value,
      author: auth.currentUser ? auth.currentUser.uid : '',
    };
    const { id } = await sync.track(addDoc(collection(database, 'polls'), poll));
    logEvent('action', { name: 'create_poll' });
    await router.push({
      name: 'polls-id',
      params: { id },
    });
  } catch (err) {
    loading.value = false;
    error.value = true;
    logError('create_poll', err);
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

    button[type='submit'] {
      justify-self: right;
    }
  }
}
</style>
