<template>
  <div id="app">
    Clicked: {{ count }} times, count is {{ evenOrOdd }}.
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
  </div>
</template>

<script>

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
  //   evenOrOdd () {
  //     return this.$store.getters.evenOrOdd
  //   }
    ...mapState([
      'count'
    ]),
    ...mapGetters([
      'evenOrOdd'
    ])
  },
  methods: {
    ...mapMutations([
      'increment'
    ]),
    ...mapActions([
      'decrement',
      'incrementIfOdd',
      'incrementAsync'
    ])
  //   increment () {
  //     this.$store.commit('increment', this.$store.state.count + 1)
  //   },
  //   decrement (state) {
  //     this.$store.commit('decrement', this.$store.state.count - 1)
  //   },
  //   incrementIfOdd () {
  //     if ((this.$store.state.count + 1) % 2 === 0) {
  //       this.$store.commit('increment')
  //     }
  //   },
  //   incrementAsync () {
  //     return new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         this.$store.commit('increment')
  //         resolve()
  //       }, 1000)
  //     })
  //   }
  }
}
</script>
