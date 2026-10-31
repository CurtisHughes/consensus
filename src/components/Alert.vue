<template>
  <div class="alert">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background: #f8d7da;
  color: #721c24;
}
</style>
