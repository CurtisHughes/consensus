<template>
  <div class="dots">
    <div
      v-for="i in Math.min(count, limit)"
      :key="i"
      :class="[{ squished: (count >= 2), withCount: (count > limit), checked }, 'dot']"
    />
    {{ (count > limit) ? `+${count - limit}` : null }}
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

  @Prop({ default: 3, type: Number })
  private limit!: number;
}
</script>

<style scoped lang="scss">
.dots {
  --dot-size: #{'min(2vw, 12px)'};

  display: flex;
  height: var(--dot-size);
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: var(--dot-size);

  .dot {
    background: #e3e3e3;
    width: var(--dot-size);
    height: var(--dot-size);
    border-radius: 50%;
    margin: 0 #{'min(.25vw, 1.25px)'};
    border: .5px solid #00000052;
  }

  .checked {
    &:last-child {
      background: var(--app-color, #CB89FF);;
    }
  }

  .squished {
    margin: 0 #{'max(-.35vw, -1.75px)'};

  }

  .withCount {
    &:last-of-type {
      margin-right: #{'min(.5vw, 2.5px)'};
    }
  }
}

</style>
