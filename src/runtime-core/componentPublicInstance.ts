import { hasOwn } from "../shared"

const publicPropertiesMap = {
  // support this.$el in options api
  $el: (instance) => instance.vnode.el,
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // if getting stuff from setupState
    const { setupState, props } = instance

    // note: check props AFTER checking setupState, thus same-name setupState shadows props
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
