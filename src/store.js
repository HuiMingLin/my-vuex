import Module from './module/module'
import { forEachValue, isPromise } from './util'

let Vue

export class Store {
  constructor (options = {}) {
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    const {
      plugins = [],
      strict = false
    } = options

    this._committing = false
    this._actions = Object.create(null)
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)

    this._watcherVM = new Vue()
    this._modules = {
      root: new Module(options)
    }

    const store = this
    const { dispatch, commit } = this

    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict

    const state = this._modules.root.state

    installModule(this, state, [], this._modules.root)

    resetStoreVM(this, state)

    // apply plugins
    plugins.forEach(plugin => plugin(this))

    console.log(this)
  }

  get state () {
    return this._vm._data.$$state
  }
  set state (v) {
    if (__DEV__) {
      console.log(`use store.replaceState() to explicit replace store state.`)
    }
  }

  dispatch (_type, _payload) {
    const type = _type
    const payload = _payload

    // const action = { type, payload }
    const entry = this._actions[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return new Promise((resolve, reject) => {
      result.then(res => {
        resolve(res)
      }, error => {
        reject(error)
      })
    })
  }

  commit (_type, _payload, _options) {
    const type = _type
    const payload = _payload

    const entry = this._mutations[type]

    if (!entry) return

    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })
  }

  _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}

function installModule (store, rootState, path, module, hot) {
  module.forEachMutation((mutation, key) => {
    registerMutation(store, key, mutation, store)
  })

  module.forEachAction((action, key) => {
    const type = key
    const handler = action.handler || action

    registerAction(store, type, handler, store)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = key
    registerGetter(store, namespacedType, getter, store)
  })
}

function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    })

    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }

    return res
  })
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (__DEV__) {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }

  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state,
      local.getters,
      store.state,
      store.getters
    )
  }
}

function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  store.getters = {}

  const wrappedGetters = store._wrappedGetters
  const computed = {}

  forEachValue(wrappedGetters, (fn, key) => {
    computed[key] = function () {
      return fn(store)
    }

    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })

  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

export function install (_Vue) {
  if (Vue && _Vue === Vue) {
    return
  }

  Vue = _Vue

  Vue.mixin({ beforeCreate: vuexInit })

  function vuexInit () {
    const options = this.$options

    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
