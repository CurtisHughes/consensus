<template>
  <div
    class="spinner"
    :style="{
      'border-color': this.color,
      'border-top-color': 'transparent',
    }"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Spinner extends Vue {
  @Prop({ default: 'var(--app-color, #CB89FF)' }) private color!: string;
}
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
