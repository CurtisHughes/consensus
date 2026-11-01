<template>
  <main>
    <section class="hero">
      <div class="content">
        <div class="intro">
          <h1>Consensus</h1>
          <p>create, vote, share. no logins required</p>
          <BaseButton inverted @click="handleClick">CREATE POLL</BaseButton>
        </div>
        <HeroDemo />
      </div>
    </section>
    <section class="steps" aria-labelledby="how-it-works">
      <h2 id="how-it-works">How it works</h2>
      <ol ref="stepsList" :class="{ revealed }">
        <li v-for="(step, index) in steps" :key="step.title" :style="{ '--index': index }">
          <span class="number" aria-hidden="true">{{ index + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </li>
      </ol>
    </section>
    <footer>
      <span>© {{ year }} Curtis Hughes</span>
      <router-link :to="{ name: 'privacy' }">Privacy</router-link>
      <a href="https://github.com/CurtisHughes/consensus" target="_blank" rel="noopener">GitHub</a>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue';
import HeroDemo from '@/components/HeroDemo.vue';

const router = useRouter();
const year = new Date().getFullYear();

const stepsList = useTemplateRef('stepsList');
const revealed = ref(typeof IntersectionObserver === 'undefined');
let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (revealed.value || !stepsList.value) return;
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      revealed.value = true;
      observer?.disconnect();
    },
    { threshold: 0.3 },
  );
  observer.observe(stepsList.value);
});

onBeforeUnmount(() => observer?.disconnect());

const steps = [
  { title: 'Create', description: 'Name your event and get a link in seconds.' },
  { title: 'Vote', description: 'Everyone taps the days they are free on a shared calendar.' },
  { title: 'Share', description: 'Send the link around and watch the best date rise to the top.' },
];

function handleClick() {
  void router.push({ name: 'polls' });
}
</script>

<style scoped lang="scss">
main {
  margin: 0;
}

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

@keyframes sweep {
  from {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
  to {
    clip-path: polygon(0 0, 100% 0, 100% 50%, 0 90%);
  }
}

.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;

  // The diagonal lives on a separate layer so it doesn't clip the demo card.
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--app-color, #ff8a8a);
    clip-path: polygon(0 0, 100% 0, 100% 50%, 0 90%);
    animation: sweep 0.9s cubic-bezier(0.65, 0, 0.35, 1) both;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 64px;
    padding: 0 30px;
    margin-bottom: 30vh;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 32px;
      margin-bottom: 20vh;
    }
  }

  // Backwards fill so the animation stops controlling transform and the button's hover lift works.
  .intro > * {
    animation: rise 0.6s ease-out backwards;
  }

  h1 {
    font-size: 36px;
    margin-bottom: 16px;
    animation-delay: 0.1s;
  }

  p {
    margin-bottom: 2em;
    animation-delay: 0.2s;
  }

  button {
    animation-delay: 0.3s;
  }
}

.steps {
  max-width: 800px;
  margin: -10vh auto 0;
  padding: 0 30px 60px;

  h2 {
    text-align: center;
  }

  ol {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 0;
    list-style: none;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  li {
    text-align: center;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.5s ease-out,
      transform 0.5s ease-out;
    transition-delay: calc(var(--index) * 120ms);
  }

  .revealed li {
    opacity: 1;
    transform: none;
  }

  .number {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--app-color, #ff8a8a);
    color: white;
    font-weight: bold;
  }

  h3 {
    margin: 12px 0 4px;
  }

  p {
    margin: 0;
    color: var(--secondary-font-color, #2c3e508a);
  }
}

footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 24px;
  padding: 20px 30px;
  border-top: 1px solid var(--border-color, #00000033);
  font-size: 14px;
  color: var(--secondary-font-color, #2c3e508a);

  a {
    color: inherit;

    &:hover {
      color: var(--primary-font-color, #2c3e50);
    }
  }
}
</style>
