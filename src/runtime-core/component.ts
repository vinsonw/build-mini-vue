import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlots"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { proxyRefs } from "src"

export function createComponentInstance(vnode, parent) {
  const instance = {
    type: vnode.type,
    vnode,
    next: null, // new vnode used in update
    setupState: {},
    props: {},
    slots: {},
    emit: () => {},
    provides: parent ? parent.provides : {},
    parent,

    // to distinguish between mount and update
    isMounted: false,
    subTree: {},
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
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

let currentInstance: any = null
export function getCurrentInstance() {
  return currentInstance
}
function setCurrentInstance(value) {
  currentInstance = value
}

function handleSetupResult(instance, setupResult: any) {
  // TODO setupResult is a function
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
