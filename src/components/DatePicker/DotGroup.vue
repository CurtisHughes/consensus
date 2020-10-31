<template>
  <div class="dots">
    <div
      v-for="i in Math.min(count, limit)"
      :key="i"
      :class="[{ squished: (count > limit) }, 'dot']"
    />
    {{ (count > limit) ? `+${count - limit}` : null }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class DotGroup extends Vue {
  @Prop({ default: 0, type: Number })
  private count!: number;

  @Prop({ default: 3, type: Number })
  private limit!: number;
}
</script>

<style scoped lang="scss">
.dots {
  display: flex;
  height: #{'min(2vw, 12px)'};
  width: 100%;
  justify-content: center;
  align-items: center;
  font-size: #{'min(2vw, 12px)'};

  .dot {
    background: var(--app-color, #CB89FF);
    width: #{'min(2vw, 12px)'};
    height: #{'min(2vw, 12px)'};
    border-radius: 50%;
    margin: 0 #{'min(.25vw, 1.25px)'};
    border: .5px solid #00000052;
  }

  .squished {
    margin: 0 #{'max(-.35vw, -1.75px)'};

    &:last-of-type {
      margin-right: #{'min(.5vw, 2.5px)'};
    }
  }
}

</style>
