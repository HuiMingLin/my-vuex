
export const mapState = (keys) => {
  const res = {}

  keys.forEach((key) => {
    res[key] = function mappedState () {
      const state = this.$store.state
      const getters = this.$store.getters

      return typeof key === 'function'
        ? key.call(this, state, getters)
        : state[key]
    }
  })

  return res
}

export const mapMutations = (keys) => {
  const res = {}

  keys.forEach((key) => {
    res[key] = function mappedMutation (...args) {
      const commit = this.$store.commit

      return typeof key === 'function'
        ? key.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [key].concat(args))
    }
  })

  return res
}

export const mapGetters = (keys) => {
  const res = {}

  keys.forEach((key) => {
    res[key] = function mappedGetter () {
      return this.$store.getters[key]
    }
  })

  return res
}

export const mapActions = (keys) => {
  const res = {}

  keys.forEach((key) => {
    res[key] = function mappedAction (...args) {
      const dispatch = this.$store.dispatch
      console.log(key)
      return typeof key === 'function'
        ? key.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [key].concat(args))
    }
  })

  console.log('res', res)
  return res
}

export const createNamespacedHelpers = () => {}
