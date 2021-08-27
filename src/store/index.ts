import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

type State = {
  syncing: boolean;
}

export default new Vuex.Store<State>({
  state: {
    syncing: false,
  },
  mutations: {
    setSyncing(state, syncing: boolean) {
      state.syncing = syncing;
    },
  },
  actions: {
    async setSyncing(context, syncing) {
      context.commit('setSyncing', syncing);
    },
  },
});
