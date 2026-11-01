<template>
  <section class="participant-name">
    <p v-if="name && !editing" class="current">
      Voting as <strong>{{ name }}</strong>
      <button type="button" class="edit" @click="startEditing">Edit</button>
    </p>
    <form v-else @submit.prevent="submit">
      <label for="participant-name">Your name</label>
      <p id="participant-name-hint" class="hint">Add your name so others know who's free.</p>
      <div class="row">
        <TextInput
          id="participant-name"
          ref="input"
          v-model="draft"
          :maxlength="NAME_LIMIT"
          name="participant-name"
          placeholder="Curtis"
          autocomplete="given-name"
          aria-describedby="participant-name-hint"
        />
        <BaseButton type="submit" :disabled="!draft.trim()">Save</BaseButton>
      </div>
    </form>
    <BaseAlert v-if="failed" class="alert" role="alert">
      Whoops! Your name wasn't saved. Please try again.
    </BaseAlert>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
import TextInput from '@/components/TextInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import { NAME_LIMIT } from '@/models/Participant';

const props = withDefaults(
  defineProps<{
    name?: string;
    suggestion?: string;
    save: (name: string) => Promise<boolean>;
  }>(),
  {
    name: '',
    suggestion: '',
  },
);

const input = useTemplateRef('input');
const draft = ref(props.name || props.suggestion);
const editing = ref(false);
const failed = ref(false);

async function startEditing() {
  draft.value = props.name;
  editing.value = true;
  await nextTick();
  (input.value?.$el as HTMLInputElement | undefined)?.focus();
}

async function submit() {
  const value = draft.value.trim();
  if (!value) return;
  editing.value = false;
  failed.value = false;
  if (!(await props.save(value))) {
    failed.value = true;
    editing.value = true;
  }
}
</script>

<style scoped lang="scss">
.participant-name {
  margin: 1.5rem 0;
}

.current {
  margin: 0;
  color: var(--secondary-font-color, #2c3e508a);

  strong {
    color: var(--primary-font-color, #2c3e50);
    overflow-wrap: anywhere;
  }
}

.edit {
  margin-left: 4px;
  padding: 0;
  border: none;
  background: none;
  color: var(--primary-font-color, #2c3e50);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--app-color, #ff8a8a);
    outline-offset: 2px;
  }
}

label {
  font-weight: bold;
}

.hint {
  margin: 0.25rem 0 0.5rem;
  font-size: 14px;
  color: var(--secondary-font-color, #2c3e508a);
}

.row {
  display: flex;
  gap: 8px;
}

.alert {
  margin-top: 0.5rem;
}
</style>
