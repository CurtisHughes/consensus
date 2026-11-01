<template>
  <input v-model="model" type="text" />
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' });
</script>

<style scoped lang="scss">
input {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  color: var(--primary-font-color, #2c3e50);
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  padding: 0.375rem 0.75rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  outline: none;
  appearance: none;

  &::placeholder {
    color: var(--secondary-font-color, #2c3e508a);
  }

  &:focus {
    border-color: var(--app-color, #cb89ff);
  }
}
</style>
