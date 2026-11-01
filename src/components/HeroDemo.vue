<template>
  <div class="demo" aria-hidden="true">
    <div class="title">Game night</div>
    <ol class="week">
      <li v-for="day in days" :key="day.number" :class="{ best: day.best }">
        <span class="weekday">{{ day.weekday[0] }}</span>
        <span class="cell">
          <span
            v-for="layer in day.layers"
            :key="layer.delay"
            class="layer"
            :style="{ '--layer-delay': `${layer.delay}s`, '--layer-opacity': layer.opacity }"
          />
          <span class="number">{{ day.number }}</span>
          <span
            v-if="day.mineDelay !== null"
            class="pick-dot"
            :style="{ '--pick-delay': `${day.mineDelay}s` }"
          />
        </span>
      </li>
    </ol>
    <div class="badge">Best date: {{ bestDay.weekday }} {{ bestDay.number }}</div>
  </div>
</template>

<script setup lang="ts">
const FIRST_VOTE_DELAY = 0.9;
const VOTE_INTERVAL = 0.18;
// Same range as the calendar's shading, so the demo matches what voters see.
const MIN_HEAT = 0.2;
const MAX_HEAT = 0.75;

const votes = [0, 1, 0, 2, 1, 3, 4];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const maxVotes = Math.max(...votes);
const myDay = votes.indexOf(maxVotes);
const myVote = 1;

// Votes arrive round-robin across the week, so every day shades in gradually.
const delays: number[][] = votes.map(() => []);
let order = 0;
for (let round = 0; round < maxVotes; round += 1) {
  votes.forEach((count, index) => {
    if (count > round) {
      delays[index]!.push(FIRST_VOTE_DELAY + order * VOTE_INTERVAL);
      order += 1;
    }
  });
}

function heat(count: number): number {
  return count === 0 ? 0 : MIN_HEAT + ((MAX_HEAT - MIN_HEAT) * count) / maxVotes;
}

// Each vote fades in another layer of the app color. Their opacities are chosen so the
// stacked layers add up to the calendar's shading for that many votes.
function layerOpacity(count: number): number {
  return 1 - (1 - heat(count)) / (1 - heat(count - 1));
}

const lastVoteDelay = FIRST_VOTE_DELAY + (order - 1) * VOTE_INTERVAL;
const highlightDelay = `${lastVoteDelay + 0.4}s`;
const badgeDelay = `${lastVoteDelay + 0.8}s`;

const days = votes.map((count, index) => ({
  weekday: weekdays[index]!,
  number: 9 + index,
  layers: delays[index]!.map((delay, vote) => ({ delay, opacity: layerOpacity(vote + 1) })),
  mineDelay: index === myDay ? delays[index]![myVote]! : null,
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

@keyframes shade {
  from {
    opacity: 0;
  }
  to {
    opacity: var(--layer-opacity);
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.15);
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
    gap: 6px;
  }

  .weekday {
    font-size: 10px;
    opacity: 0.6;
  }

  .cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 5px;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 5px;
    background: var(--surface-color, #e8e8e8);
  }

  .layer {
    position: absolute;
    inset: 0;
    background: var(--app-color, #ff8a8a);
    animation: shade 0.3s var(--layer-delay, 0s) ease-out both;
  }

  .number {
    position: relative;
    font-size: 14px;
  }

  .pick-dot {
    position: absolute;
    top: calc(50% + 7px);
    left: 50%;
    width: 5px;
    height: 5px;
    margin-left: -2.5px;
    border-radius: 50%;
    background: currentColor;
    animation: pop 0.35s var(--pick-delay, 0s) ease-out both;
  }

  .best .cell {
    animation: pulse 0.5s var(--highlight-delay) ease-in-out;
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
