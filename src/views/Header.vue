<template>
  <header>
    <h3 @click="$router.push({ name: 'home' })">Consensus</h3>
    <div class="circle" />
  </header>
</template>

<style scoped lang="scss">
header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, .15);

  h3 {
    margin-left: 30px;
  }

  .circle {
    background: var(--app-color, #CB89FF);
    width: 20px;
    height: 20px;
    margin-right: 30px;
    margin-left: 30px;
    border-radius: 50%;
  }
}
</style>
