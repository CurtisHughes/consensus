<template>
  <main>
    <h1>Create a poll</h1>
    <p class="intro">Give your event a name, then share the link so everyone can pick dates.</p>
    <BaseAlert v-if="error" class="alert" role="alert">Whoops! Something went wrong.</BaseAlert>
    <BaseAlert v-else-if="sync.slow" class="alert" role="status">
      Still saving. Check your internet connection.
    </BaseAlert>
    <form :style="{ opacity: loading ? '65%' : '100%' }" @submit.prevent="handleSubmit">
      <label for="event">Event Name:</label>
      <TextInput
        id="event"
        ref="nameInput"
        v-model="name"
        :disabled="loading"
        required
        :maxlength="NAME_LIMIT"
        name="event"
        placeholder="Camping trip"
        aria-describedby="event-count"
      />
      <span id="event-count" class="counter" :class="{ visible: nearLimit(name, NAME_LIMIT) }">
        {{ name.length }} / {{ NAME_LIMIT }}
      </span>

      <label for="description">Description (optional):</label>
      <TextArea
        id="description"
        v-model="description"
        :maxlength="DESCRIPTION_LIMIT"
        :disabled="loading"
        name="description"
        rows="5"
        placeholder="Let's go outside!"
        aria-describedby="description-count"
      />
      <span
        id="description-count"
        class="counter"
        :class="{ visible: nearLimit(description, DESCRIPTION_LIMIT) }"
      >
        {{ description.length }} / {{ DESCRIPTION_LIMIT }}
      </span>

      <BaseButton type="submit" :disabled="loading">
        {{ loading ? 'CREATING...' : 'CREATE' }}
      </BaseButton>
    </form>
    <span v-if="loading" class="overlay">
      <BaseSpinner />
    </span>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
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

// Must match the limits enforced in firestore.rules.
const NAME_LIMIT = 200;
const DESCRIPTION_LIMIT = 2000;

const router = useRouter();
const sync = useSyncStore();
const nameInput = useTemplateRef('nameInput');

const name = ref('');
const description = ref('');
const error = ref(false);
const loading = ref(false);

onMounted(() => {
  (nameInput.value?.$el as HTMLInputElement | undefined)?.focus();
});

function nearLimit(value: string, limit: number): boolean {
  return value.length >= limit * 0.8;
}

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
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 30px;

  .intro {
    color: var(--secondary-font-color, #2c3e508a);
  }

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
    left: 0;
    z-index: 1;
  }

  form {
    display: grid;
    grid-row-gap: 8px;

    .counter {
      justify-self: end;
      font-size: 12px;
      color: var(--secondary-font-color, #2c3e508a);
      visibility: hidden;

      &.visible {
        visibility: visible;
      }
    }

    button[type='submit'] {
      justify-self: end;
    }
  }
}
</style>
