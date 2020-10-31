<template>
  <button
    @click="$emit('click')"
    :color="color"
    :inverted="inverted"
    :disabled="disabled"
    :style="{
      background: (inverted) ? 'none' : color,
    }"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
  @Prop({ default: 'var(--app-color, #CB89FF)' })
  private color!: string;

  @Prop({ default: false, type: Boolean })
  private inverted!: boolean;

  @Prop({ default: false, type: Boolean })
  private disabled!: boolean;
}
</script>

<style scoped lang="scss">
button {
    color: #fff;
    border: 1px solid;
    border-radius: 5px;
    padding: 5px 15px 5px 15px;
    outline: none;
    font-size: 16px;

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      opacity: 65%;
      cursor: not-allowed;
    }
}
</style>
