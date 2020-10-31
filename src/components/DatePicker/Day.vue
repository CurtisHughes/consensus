<template>
  <div @click="$emit('click', day)" :class="[{ checked }, 'day']">
    <p>{{ day }}</p>
    <DotGroup :count="events.length" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CalendarEvent } from './models';
import DotGroup from './DotGroup.vue';

@Component({
  components: {
    DotGroup,
  },
})
export default class Day extends Vue {
  @Prop({ type: Number, required: true })
  private day!: number;

  @Prop({ default: [] })
  private events!: CalendarEvent[];

  private get checked() {
    return this.events.find(({ checked }) => checked);
  }
}
</script>

<style scoped lang="scss">
.checked {
  background: #c4c4c44d;
}

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
</style>
