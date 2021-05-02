<template>
  <div class="dots">
    <div class="count">
      {{ (count > limit) ? `+${count - limit}` : null }}
    </div>
    <div
      v-for="i in Math.min(count, limit)"
      :key="i"
      :class="[{ checked }, 'dot']"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class DotGroup extends Vue {
  @Prop({ default: false, type: Boolean })
  private checked!: boolean;

  @Prop({ default: 0, type: Number })
  private count!: number;

  @Prop({ default: 4, type: Number })
  private limit!: number;
}
</script>

<style scoped lang="scss">
.dots {
  --dot-size: #{'min(2vw, 10px)'};

  position: relative;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  height: var(--dot-size);
  width: 100%;
  align-items: center;
  font-size: var(--dot-size);

  .dot {
    width: var(--dot-size);
    height: var(--dot-size);
    margin: calc(-1 * var(--dot-size) / 4);
    background: #BCBCBC;
    border-radius: 50%;
    border: .5px solid #00000052;
  }

  .dot.checked {
    &:last-child {
      background: var(--app-color, #CB89FF);
    }
  }

  .count {
    position: absolute;
    right: 0;
  }
}

</style>
