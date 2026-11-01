<template>
  <div :class="['share-button', { 'can-share': canShare }]">
    <div ref="textElement" class="text">{{ text }}</div>
    <button aria-label="Copy link" :class="{ copied }" @click="copy">
      <svg
        v-if="!copied"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.3332 0.833252H3.33317C2.41234 0.833252 1.6665 1.57909 1.6665 2.49992V14.1666H3.33317V2.49992H13.3332V0.833252ZM15.8332 4.16654H6.66654C5.74571 4.16654 4.99988 4.91321 4.99988 5.83321V17.4999C4.99988 18.4199 5.74571 19.1665 6.66654 19.1665H15.8332C16.7532 19.1665 17.4999 18.4199 17.4999 17.4999V5.83321C17.4999 4.91321 16.7532 4.16654 15.8332 4.16654ZM6.6665 5.83321H15.8332V17.4999H6.6665V5.83321Z"
          fill="black"
          fill-opacity="0.3"
        />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 10.5l4 4 8-9"
          stroke="#2e9e5b"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button v-if="canShare" aria-label="Share link" class="share" @click="share">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2.5v10M6 6.5l4-4 4 4M4 10.5v5.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-5.5"
          stroke="black"
          stroke-opacity="0.3"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <span class="status" role="status">{{ status }}</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef } from 'vue';

const props = defineProps<{
  text: string;
  title?: string;
}>();

const canShare = typeof navigator.share === 'function';
const textElement = useTemplateRef('textElement');
const copied = ref(false);
const status = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy() {
  clearTimeout(timer);
  try {
    await navigator.clipboard.writeText(props.text);
  } catch {
    selectText();
    status.value = "Couldn't copy automatically. The link is selected, so copy it manually.";
    timer = setTimeout(() => (status.value = ''), 4000);
    return;
  }
  copied.value = true;
  status.value = 'Link copied';
  timer = setTimeout(() => {
    copied.value = false;
    status.value = '';
  }, 1500);
}

async function share() {
  try {
    await navigator.share({ title: props.title, url: props.text });
  } catch (err) {
    // AbortError means the user closed the share sheet.
    if (err instanceof DOMException && err.name === 'AbortError') return;
    await copy();
  }
}

function selectText() {
  const selection = window.getSelection();
  if (!textElement.value || !selection) return;
  selection.selectAllChildren(textElement.value);
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style lang="scss" scoped>
.share-button {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 40px;
  width: 100%;
  border: 1px solid var(--border-color, #00000033);
  border-radius: var(--radius, 5px);
  overflow: hidden;
  height: 40px;

  &.can-share {
    grid-template-columns: 1fr 40px 40px;
  }

  .text {
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: none;
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
    transition: background 0.2s;

    &:hover {
      background: #c4c4c480;
    }

    &:focus-visible {
      outline: 2px solid var(--app-color, #ff8a8a);
      outline-offset: -2px;
    }

    &.copied {
      background: #2e9e5b26;
    }
  }

  .share {
    border-left: 1px solid var(--border-color, #00000033);
  }

  .status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
