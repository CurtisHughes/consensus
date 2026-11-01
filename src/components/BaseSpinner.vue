<template>
  <div
    class="spinner"
    :style="{
      'border-color': color,
      'border-top-color': 'transparent',
    }"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
  }>(),
  {
    color: 'var(--app-color, #FF8A8A)',
  },
);
</script>

<style scoped lang="scss">
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid;
  border-radius: 50%;
  animation: spin 1.5s infinite linear;
}
</style>
