<template>
  <span class="dots" aria-hidden="true">
    <span class="count">
      {{ count > limit ? `+${count - limit}` : null }}
    </span>
    <span v-for="i in Math.min(count, limit)" :key="i" :class="[{ checked }, 'dot']" />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    checked?: boolean;
    count?: number;
    limit?: number;
  }>(),
  {
    checked: false,
    count: 0,
    limit: 4,
  },
);
</script>

<style scoped lang="scss">
@keyframes grow {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

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
    background: #bcbcbc;
    border-radius: 50%;
    border: 0.5px solid #00000052;
  }

  .dot.checked {
    &:last-child {
      background: var(--app-color, #cb89ff);
      animation: grow 0.25s cubic-bezier(0, 0, 0, 2);
    }
  }

  .count {
    position: absolute;
    right: 0;
    color: var(--primary-font-color, #2c3e50);
  }
}
</style>
