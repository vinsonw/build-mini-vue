import { patch } from "./renderer"

export function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    vnode,
    setupState: {},
  }
  return instance
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        // if getting stuff from setupState
        const { setupState } = instance
        if (key in setupState) {
          return setupState[key]
        }
      },
    },
  )

  const { setup } = Component

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // TODO setupResult is a function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
