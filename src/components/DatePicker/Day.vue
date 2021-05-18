<template>
  <li :class="[{ checked }, 'day-container']">
    <div @click="$emit('click', day)" :class="[{ highlighted }, 'day']">
      <p>{{ day }}</p>
      <DotGroup :count="events.length" :checked="checked" :limit="limit" />
    </div>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CalendarEvent } from './models';
import Dot from './Dot.vue';
import DotGroup from './DotGroup.vue';

@Component({
  components: {
    Dot,
    DotGroup,
  },
})
export default class Day extends Vue {
  @Prop({ type: Number, required: true })
  private day!: number;

  @Prop({ type: Boolean, default: false })
  private highlighted!: boolean;

  @Prop({ default: [] })
  private events!: CalendarEvent[];

  // eslint-disable-next-line class-methods-use-this
  private get limit() {
    // eslint-disable-next-line no-restricted-globals
    return screen.width > 525 ? 4 : 3;
  }

  private get checked() {
    return !!this.events.find(({ checked }) => checked);
  }
}
</script>

<style scoped lang="scss">
.day {
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 15%;
  width: 70%;
  height: 70%;
  top: 0;

  p {
    margin: 0;
    flex-grow: 1;
  }
}

.day-container {
  cursor: pointer;
}

.day-container.checked {
  background: #BCBCBC;
}

.day.highlighted {
  color: var(--app-color, #CB89FF);
}
</style>
