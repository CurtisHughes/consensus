<template>
  <div class="alert">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.alert {
  position: relative;
  padding: .75rem 1.25rem;
  border: 1px solid transparent;
  border-radius: .25rem;
  background: #f8d7da;
  color: #721c24;
}
</style>
