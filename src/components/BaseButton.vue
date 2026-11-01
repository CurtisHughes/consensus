<template>
  <button
    :disabled="disabled"
    :class="{ inverted }"
    :style="inverted ? undefined : { background: color }"
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
    color: 'var(--app-color, #FF8A8A)',
    inverted: false,
    disabled: false,
  },
);
</script>

<style scoped lang="scss">
button {
  color: #fff;
  border: 1px solid;
  border-radius: var(--radius, 5px);
  padding: 5px 15px 5px 15px;
  outline: none;
  font-size: 16px;
  font-family: inherit;
  transition:
    filter 0.15s,
    box-shadow 0.15s,
    background 0.2s,
    color 0.2s,
    transform 0.2s;

  &:hover:not(:disabled) {
    cursor: pointer;
    filter: brightness(1.08);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &.inverted {
    background: none;

    &:hover:not(:disabled) {
      background: white;
      border-color: white;
      color: var(--app-color, #ff8a8a);
      filter: none;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    &:active:not(:disabled) {
      transform: none;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--primary-font-color, #2c3e50);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 65%;
    cursor: not-allowed;
  }
}
</style>
