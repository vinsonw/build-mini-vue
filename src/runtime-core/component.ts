import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlots"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const instance = {
    type: vnode.type,
    vnode,
    setupState: {},
    props: {},
    slots: {},
    emit: () => {},
  }
  instance.emit = emit.bind(null, instance) as any
  return instance
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const Component = instance.type

  // prepare `this` binding for render()
  instance.proxy = new Proxy(
    { _: instance /* for PublicInstanceProxyHandlers to access instance  */ },
    PublicInstanceProxyHandlers,
  )

  const { setup } = Component

  if (setup) {
    console.log("instance", instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
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
