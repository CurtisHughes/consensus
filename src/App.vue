<template>
  <div id="app">
    <router-view name="header" />
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<style lang="scss">
#app {
  --app-color: #ff8a8a;
  --primary-font-color: #2c3e50;
  --secondary-font-color: #2c3e508a;
  --border-color: #00000033;
  --input-border-color: #ced4da;
  --surface-color: #e8e8e8;
  --focus-ring: 0 0 0 3px #ff8a8a40;
  --radius: 5px;

  font-family: Montserrat, Avenir, Helvetica, Arial, sans-serif;
  color: var(--primary-font-color, #2c3e50);
}

body {
  margin: 0;
}

main {
  margin: 30px;
  margin-top: 90px;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

// Spinners keep turning, since they're the only sign that something is loading.
@media (prefers-reduced-motion: reduce) {
  *:not(.spinner),
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
  }
}
</style>
