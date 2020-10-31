<template>
  <div class="share-button">
    <div class="text">{{text}}</div>
    <button @click="copy">
      <!-- eslint-disable -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3332 0.833252H3.33317C2.41234 0.833252 1.6665 1.57909 1.6665 2.49992V14.1666H3.33317V2.49992H13.3332V0.833252ZM15.8332 4.16654H6.66654C5.74571 4.16654 4.99988 4.91321 4.99988 5.83321V17.4999C4.99988 18.4199 5.74571 19.1665 6.66654 19.1665H15.8332C16.7532 19.1665 17.4999 18.4199 17.4999 17.4999V5.83321C17.4999 4.91321 16.7532 4.16654 15.8332 4.16654ZM6.6665 5.83321H15.8332V17.4999H6.6665V5.83321Z" fill="black" fill-opacity="0.3"/>
      </svg>
      <!-- eslint-enable -->
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ShareTextButton extends Vue {
  @Prop({ type: String, required: true })
  private text!: string;

  private copy() {
    navigator.clipboard.writeText(this.text);
  }
}
</script>

<style lang="scss" scoped>
.share-button {
  display: grid;
  grid-template-columns: 1fr 40px;
  width: 100%;
  border: 1px solid #00000033;
  height: 40px;

  .text {
    overflow-y: auto;
    align-self: center;
    padding: 10px;
    color: var(--secondary-font-color, #2c3e508a);
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background: #c4c4c44d;
    margin: 0;
    cursor: pointer;
  }
}
</style>
