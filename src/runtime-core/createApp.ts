import { createVNode } from "./vnode"

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // rootComponent needs to be converted to vnode first
        const vnode = createVNode(rootComponent)
        // then render vnode into rootContainer
        render(vnode, rootContainer)
      },
    }
  }
}
