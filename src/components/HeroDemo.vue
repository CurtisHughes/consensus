<template>
  <div class="demo" aria-hidden="true">
    <div class="title">Game night</div>
    <ol class="week">
      <li v-for="day in days" :key="day.number" :class="{ best: day.best }">
        <span class="weekday">{{ day.weekday[0] }}</span>
        <span class="number">{{ day.number }}</span>
        <span class="dots">
          <span
            v-for="delay in day.delays"
            :key="delay"
            class="dot"
            :style="{ '--dot-delay': `${delay}s` }"
          />
        </span>
      </li>
    </ol>
    <div class="badge">Best date: {{ bestDay.weekday }} {{ bestDay.number }}</div>
  </div>
</template>

<script setup lang="ts">
const FIRST_DOT_DELAY = 0.9;
const DOT_INTERVAL = 0.12;

const votes = [0, 1, 0, 2, 1, 3, 4];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const maxVotes = Math.max(...votes);

// Dots appear round-robin across the week, so every day fills in gradually.
const delays: number[][] = votes.map(() => []);
let order = 0;
for (let round = 0; round < maxVotes; round += 1) {
  votes.forEach((count, index) => {
    if (count > round) {
      delays[index]!.push(FIRST_DOT_DELAY + order * DOT_INTERVAL);
      order += 1;
    }
  });
}

const lastDotDelay = FIRST_DOT_DELAY + (order - 1) * DOT_INTERVAL;
const highlightDelay = `${lastDotDelay + 0.4}s`;
const badgeDelay = `${lastDotDelay + 0.7}s`;

const days = votes.map((count, index) => ({
  weekday: weekdays[index]!,
  number: 9 + index,
  delays: delays[index]!,
  best: count === maxVotes,
}));
const bestDay = days.find((day) => day.best)!;
</script>

<style scoped lang="scss">
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes pop {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes highlight {
  to {
    background: var(--app-color, #ff8a8a);
    color: white;
  }
}

@keyframes invert {
  to {
    background: white;
  }
}

.demo {
  --highlight-delay: v-bind(highlightDelay);

  width: 300px;
  max-width: 100%;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 12px;
  background: white;
  color: var(--primary-font-color, #2c3e50);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  animation: rise 0.6s 0.3s ease-out both;
}

.title {
  font-weight: bold;
  margin-bottom: 12px;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 0;
    border-radius: 6px;
    background: var(--surface-color, #e8e8e8);
  }

  .weekday {
    font-size: 10px;
    opacity: 0.6;
  }

  .number {
    font-size: 14px;
  }

  .dots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
    width: 26px;
    min-height: 12px;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--app-color, #ff8a8a);
    animation: pop 0.35s var(--dot-delay, 0s) ease-out both;
  }

  .best {
    animation: highlight 0.4s var(--highlight-delay) ease-out forwards;

    .dot {
      animation:
        pop 0.35s var(--dot-delay, 0s) ease-out both,
        invert 0.4s var(--highlight-delay) ease-out forwards;
    }
  }
}

.badge {
  display: inline-block;
  margin-top: 12px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--app-color, #ff8a8a);
  color: white;
  font-size: 12px;
  animation: pop 0.4s v-bind(badgeDelay) ease-out both;
}
</style>
