<template>
  <div class="date-picker">
    <header>
      <button @click="prev">
        <Arrow inverse />
      </button>
      <h1>
        {{ date.toLocaleString("default", { month: "long" }) }} {{ year }}
      </h1>
      <button @click="next">
        <Arrow />
      </button>
    </header>

    <ul class="weekday-list">
      <li>
        <abbr title="Sunday">S</abbr>
      </li>
      <li>
        <abbr title="Monday">M</abbr>
      </li>
      <li>
        <abbr title="Tuesday">T</abbr>
      </li>
      <li>
        <abbr title="Wednesday">W</abbr>
      </li>
      <li>
        <abbr title="Thursday">T</abbr>
      </li>
      <li>
        <abbr title="Friday">F</abbr>
      </li>
      <li>
        <abbr title="Saturday">S</abbr>
      </li>
    </ul>

    <ul class="day-list">
      <li v-for="day in offset" :key="`prev-month-day-${day}`"></li>
      <li v-for="day in days" :key="`day-${day}`">
        <Day
          :day="day"
          :events="(collection.get({ day, month, year }) || [])"
          @click="onClick"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Emit,
  Prop,
  Vue,
} from 'vue-property-decorator';
import Day from './Day.vue';
import { CalendarEventCollection } from './models';
import Arrow from './Arrow.vue';

@Component({
  components: {
    Arrow,
    Day,
  },
})
export default class DatePicker extends Vue {
  @Prop({ default: {} })
  private collection!: CalendarEventCollection;

  private date: Date = new Date();

  private next() {
    this.date = new Date(this.year, this.month + 1);
  }

  private prev() {
    this.date = new Date(this.year, this.month - 1);
  }

  private get year() {
    return this.date.getFullYear();
  }

  private get month() {
    return this.date.getMonth();
  }

  private get offset() {
    return new Date(this.year, this.month).getDay();
  }

  private get days() {
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  @Emit('input')
  private onClick(day: number) {
    return {
      year: this.year,
      month: this.month,
      day,
    };
  }
}
</script>

<style scoped lang="scss">
.date-picker {
  max-width: 500px;
}

header {
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  h1 {
    font-size: #{'min(5vw, 22.5px)'};
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    height: #{'min(12vw, 60px)'};
    width: #{'min(12vw, 60px)'};

    svg {
      width: #{'min(3vw, 15px)'};
      height: #{'min(3vw, 15px)'};
    }
  }
}

ul {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 1px;
  padding: 0;
  place-items: start;
}

li {
  position: relative;
  list-style: none;
  width: 100%;
}

.day-list {
  font-size: #{'min(4vw, 20px)'};

  li {
    padding-bottom: 100%;
  }
}

.weekday-list {
  font-size: #{'min(5vw, 25px)'};
  text-align: center;

  li {
    color: var(--secondary-font-color, #2c3e508a);

    abbr {
      text-decoration: none;
    }
  }
}
</style>
