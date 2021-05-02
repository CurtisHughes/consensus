<template>
  <div @click="$emit('click', day)" :class="[{ checked, highlighted }, 'day']">
    <p>{{ day }}</p>
    <!-- <DotGroup :count="events.length" :checked="checked" /> -->
    <Dot :hidden="events.length === 0" :checked="checked" />
  </div>
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
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;

  p {
    margin: 0;
    margin-bottom: #{'min(1vw, 5px)'};
  }
}

.day.checked {
  background: #c4c4c44d;
}

.day.highlighted {
  color: var(--app-color, #CB89FF);
}
</style>
