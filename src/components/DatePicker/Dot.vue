<template>
  <div :class="[{ checked, hidden }, 'dot']" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class DotGroup extends Vue {
  @Prop({ default: false, type: Boolean })
  private checked!: boolean;

  @Prop({ default: false, type: Boolean })
  private hidden!: boolean;
}
</script>

<style scoped lang="scss">
.dot {
  background: #e3e3e3;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.checked {
  background: var(--app-color, #CB89FF);
}

.dot.hidden {
  visibility: hidden;
}
</style>
