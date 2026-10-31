<template>
  <button
    :disabled="disabled"
    :style="{
      background: inverted ? 'none' : color,
    }"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    inverted?: boolean;
    disabled?: boolean;
  }>(),
  {
    color: 'var(--app-color, #CB89FF)',
    inverted: false,
    disabled: false,
  },
);
</script>

<style scoped lang="scss">
button {
  color: #fff;
  border: 1px solid;
  border-radius: 5px;
  padding: 5px 15px 5px 15px;
  outline: none;
  font-size: 16px;

  &:hover {
    cursor: pointer;
  }

  &:disabled {
    opacity: 65%;
    cursor: not-allowed;
  }
}
</style>
