<template>
  <div id="app">
    <router-view name="header" />
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  --app-color: #ff8a8a;
  --primary-font-color: #2c3e50;
  --secondary-font-color: #2c3e508a;

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
</style>
