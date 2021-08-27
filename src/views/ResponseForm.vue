<template>
  <main>
    <h1>{{ poll.name }}</h1>
    <p>{{ poll.description }}</p>
    <DatePicker :collection="eventCollection" @input="toggleResponse" />
    <h2>Suggested Dates:</h2>
    <ul class="suggestions">
      <li v-for="{ date, count } in suggestions" :key="date.toLocaleDateString()">
        <p>{{ date.toLocaleDateString() }}</p>
        <p>{{ count }} / {{ authors.size }}</p>
      </li>
    </ul>
    <ShareTextButton :text="shareLinkText" />
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import { CalendarEventCollection, CalendarDate } from '@/components/DatePicker/models';
import ShareTextButton from '@/components/ShareTextButton.vue';
import database from '@/gateways/database';
import auth from '@/gateways/authentication';
import analytics from '@/gateways/analytics';
import {
  Poll, Response, Document, DateValue,
} from '@/models';

@Component({
  components: {
    ShareTextButton,
    DatePicker,
  },
})
export default class ResponseForm extends Vue {
  private poll: Document<Poll> = {} as Document<Poll>;

  private responses: Document<Response<DateValue>>[] = [];

  private unsubscribeFromPoll!: () => void;

  private unsubscribeFromResponses!: () => void;

  private shareLinkText = window.location.href;

  public async mounted() {
    const { id } = this.$route.params;
    this.unsubscribeFromResponses = database.collection('polls').doc(id).collection('responses').onSnapshot(this.handleResponsesSnapshot);
    this.unsubscribeFromPoll = database.collection('polls').doc(id).onSnapshot(this.handlePollSnapshot);
  }

  public beforeDestroy() {
    this.unsubscribeFromPoll();
    this.unsubscribeFromResponses();
  }

  private handlePollSnapshot(
    document: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>,
  ) {
    this.poll = {
      id: document.id,
      ...document.data() as Poll,
    };
  }

  private handleResponsesSnapshot(
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
  ) {
    const responses: Document<Response<DateValue>>[] = [];
    snapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...doc.data() as Response<DateValue>,
      });
    });
    this.responses = responses;
  }

  private async toggleResponse(date: CalendarDate) {
    try {
      await this.$store.dispatch('setSyncing', true);
      const existing = this.responses
        .find(({ author, value: { day, month, year } }) => (
          author === (auth.currentUser && auth.currentUser.uid)
            && day === date.day
            && month === date.month
            && year === date.year
        ));
      if (existing) {
        await database.collection('polls').doc(this.poll.id).collection('responses').doc(existing.id)
          .delete();
        analytics.logEvent('action', { name: 'delete_response', user: auth.currentUser?.uid });
      } else {
        const response: Response<DateValue> = {
          author: auth.currentUser ? auth.currentUser.uid : '',
          value: date,
        };
        await database.collection('polls').doc(this.poll.id).collection('responses').add(response);
        analytics.logEvent('action', { name: 'create_response', user: auth.currentUser?.uid });
      }
    } catch (err) {
      analytics.logEvent('error', { name: 'toggle_response', user: auth.currentUser?.uid, error: err });
    } finally {
      setTimeout(() => {
        this.$store.dispatch('setSyncing', false);
      }, 500);
    }
  }

  private get eventCollection() {
    return this.responses.reduce(
      (acc, { author, value }) => acc.add(value, {
        checked: (auth.currentUser && auth.currentUser.uid) === author,
      }), new CalendarEventCollection(),
    );
  }

  private get authors() {
    return this.responses.reduce((acc, { author }) => acc.add(author), new Set());
  }

  private get suggestions() {
    const suggestions = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { events, date: { year, month, day } } of this.eventCollection) {
      suggestions.push({ date: new Date(year, month, day), count: events.length });
    }

    return suggestions
      .sort((a, b) => (b.count - a.count) || (a.date.getTime() - b.date.getTime()))
      .slice(0, 3);
  }
}
</script>

<style scoped lang="scss">

main {
  max-width: 500px;
  margin: 30px auto;
  padding: 0 30px;

  p {
    color: var(--secondary-font-color, #2c3e508a);
  }
}

.suggestions {
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    list-style: none;

    p {
      color: var(--secondary-font-color, #2c3e508a);
      margin-top: 0;
    }
  }
}

</style>
