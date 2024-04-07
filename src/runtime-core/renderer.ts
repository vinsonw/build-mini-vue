import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"
import { effect } from "src/reactivity/effect"
import { EMPTY_OBJ } from "src/shared"

export function createRenderer(options: {
  createElement: (type: string) => any
  patchProp: (el: any, key: any, prevVal: any, nextVal: any) => any
  insert: (el: any, parent: any) => any
  remove: (el: any) => any
  setElementText: (container: any, text: any) => any
}) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options
  function render(vnode, rootContainer) {
    // debugger
    // patch
    patch(null, vnode, rootContainer, null)
  }

  // n1: old vnode
  // n2: new vnode
  function patch(n1, n2, container: HTMLElement, parentComponent) {
    // debugger
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

        console.log("subTree", subTree)

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance)

        // root dom node of a component is the root dom of subtree
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
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    console.log("patchElement n1, n2", { n1, n2 })

    // patch props
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el) // n2 may have no el since el is attached in mountElement

    patchChildren(n1, n2, container, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    // only two children of vnode is allowed: text, array
    // n1.children is text, n2.children is array
    const prevShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // n2.children is ShapeFlags.TEXT_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(container)
      }

      if (n1.children !== n2.children) {
        hostSetElementText(container, n2.children)
      }
    } else {
      // n2.children is ShapeFlags.ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "")
        mountChildren(n2.children, container, parentComponent)
      } else {
        // TODO array to array
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length - 1; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps === newProps) return

    // update props that exist in newProps
    // but have a different value in oldProps
    // or does not exist in oldProps
    for (const key in newProps) {
      const prevProp = oldProps[key]
      const newProp = newProps[key]

      if (prevProp !== newProp) {
        hostPatchProp(el, key, prevProp, newProp)
      }
    }

    if (oldProps === EMPTY_OBJ) return

    // delete props only in oldProps and not in newProps
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
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
      hostPatchProp(el, key, null, val)
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
