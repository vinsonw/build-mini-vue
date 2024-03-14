import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options
  function render(vnode, rootContainer) {
    // patch
    patch(vnode, rootContainer, null)
  }

  function patch(vnode, container: HTMLElement, parentComponent) {
    const { shapeFlag, type } = vnode
    // Fragment -> only render its children
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        } else {
          console.warn("not patching vnode", vnode)
        }

        break
    }
  }

  function processFragment(vnode, container, parentComponent) {
    // reuse mountChildren
    mountChildren(vnode.children, container, parentComponent)
  }

  function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processComponent(
    vnode: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    mountComponent(vnode, container, parentComponent)
  }

  function mountComponent(
    initialVnode: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
  }

  function setupRenderEffect(instance, initialVnode, container: HTMLElement) {
    const { proxy } = instance
    // so-called subTree is just root vnode of a component
    const subTree = instance.render.call(proxy)

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container, instance)

    // root dom node of a component is the root component of subtree
    initialVnode.el = subTree.el
  }

  function processElement(
    vnode: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    // implement
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(
    vnode: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    const { children, props, shapeFlag } = vnode
    // const el = (vnode.el = document.createElement(vnode.type) as HTMLElement)
    const el = (vnode.el = hostCreateElement(vnode.type) as HTMLElement)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, val)
    }

    hostInsert(el, container)
    // container.append(el)
  }

  function mountChildren(children: any, container: any, parentComponent) {
    children.forEach((child) => patch(child, container, parentComponent))
  }

  return {
    createApp: createAppAPI(render),
  }
}
