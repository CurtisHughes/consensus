<template>
  <main>
    <h1>Page not found</h1>
    <p>We couldn't find the page you were looking for. Check the link and try again.</p>
    <router-link :to="{ name: 'home' }">Back to home</router-link>
  </main>
</template>

<style scoped lang="scss">
main {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 30px;

  p {
    color: var(--secondary-font-color, #2c3e508a);
  }

  a {
    color: var(--app-color, #cb89ff);
  }
}
</style>
