<template>
  <div id="app">
    <router-view name="header" />
    <router-view />
  </div>
</template>

<style lang="scss">
@import url(//fonts.googleapis.com/css?family=Montserrat);

#app {
  --app-color: #FF8A8A;
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
}
</style>
