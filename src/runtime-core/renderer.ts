import {
  createComponentInstance,
  setupComponent,
  setupRenderEffect,
} from "./component"

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}

export function patch(vnode, container) {
  if (typeof vnode.type === "string") {
    // TODO
    // processElement(vnode, container)
  } else {
    processComponent(vnode, container)
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}
