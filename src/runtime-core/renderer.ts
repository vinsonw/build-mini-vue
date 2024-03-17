import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"
import { effect } from "src/reactivity/effect"

export function createRenderer(options: {
  createElement: (type: string) => any
  patchProp: (el: any, key: any, val: any) => any
  insert: (el: any, parent: any) => any
}) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options
  function render(vnode, rootContainer) {
    // patch
    patch(null, vnode, rootContainer, null)
  }

  // n1: old vnode
  // n2: new vnode
  function patch(n1, n2, container: HTMLElement, parentComponent) {
    const { shapeFlag, type } = n2
    // Fragment -> only render its children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        } else {
          console.warn("not patching vnode", n2)
        }

        break
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    // reuse mountChildren
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processComponent(
    n1,
    n2: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    mountComponent(n2, container, parentComponent)
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
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        // so-called subTree is just root vnode of a component
        const subTree = (instance.subTree = instance.render.call(proxy))

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance)

        // root dom node of a component is the root component of subtree
        initialVnode.el = subTree.el

        instance.isMounted = true
      } else {
        // update
        console.log("update")
        const { proxy } = instance
        const prevSubtree = instance.subTree
        const subTree = instance.render.call(proxy)
        instance.subTree = subTree
        patch(prevSubtree, subTree, container, instance)
      }
    })
  }

  function processElement(
    n1,
    n2: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
  ) {
    // implement
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement n1, n2", { n1, n2 })
    // TODO impl patch element
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
    children.forEach((child) => patch(null, child, container, parentComponent))
  }

  return {
    createApp: createAppAPI(render),
  }
}
