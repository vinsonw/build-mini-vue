import { patch } from "./renderer"

export function createComponentInstance(vnode) {
  const component = {
    type: vnode.type,
    vnode,
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}
function setupStatefulComponent(instance) {
  const Component = instance.type
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

export function setupRenderEffect(instance, container) {
  // so-called subTree is just root vnode of a component
  const subTree = instance.render()

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}
