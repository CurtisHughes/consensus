import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

type State = {
  count: number;
}

export default new Vuex.Store<State>({
  state: {
    count: 0,
  },
  getters: {
    syncing: (state: State) => state.count > 0,
  },
  mutations: {
    incrementCount(state) {
      state.count += 1;
    },
    decrementCount(state) {
      state.count -= 1;
    },
  },
  actions: {
    async setSyncing(context, syncing) {
      context.commit('incrementCount');
      await syncing;
      context.commit('decrementCount');
    },
  },
});
