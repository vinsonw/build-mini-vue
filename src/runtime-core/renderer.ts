import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from "./createApp"
import { effect } from "src/reactivity/effect"
import { EMPTY_OBJ } from "src/shared"
import { getSequence } from "./algo"

export function createRenderer(options: {
  createElement: (type: string) => any
  patchProp: (el: any, key: any, prevVal: any, nextVal: any) => any
  insert: (el: any, parent: any, anchor: any) => any
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
    patch(null, vnode, rootContainer, null, null)
  }

  // n1: old vnode
  // n2: new vnode
  function patch(n1, n2, container: HTMLElement, parentComponent, anchor) {
    // debugger
    const { shapeFlag, type } = n2
    // Fragment -> only render its children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // console.log("processElement anchor", anchor)
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        } else {
          console.warn("not patching vnode", n2)
        }

        break
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    // reuse mountChildren
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    console.log("text el", textNode)
    container.append(textNode)
  }

  function processComponent(
    n1,
    n2: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
    anchor,
  ) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function mountComponent(
    initialVnode: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
    anchor,
  ) {
    const instance = createComponentInstance(initialVnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container, anchor)
  }

  function setupRenderEffect(
    instance,
    initialVnode,
    container: HTMLElement,
    anchor,
  ) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        // so-called subTree is just root vnode of a component
        const subTree = (instance.subTree = instance.render.call(proxy))

        // console.log("subTree", JSON.stringify(subTree))
        console.log("subTree", subTree)

        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor)

        // root dom node of a component is the root dom of subtree
        initialVnode.el = subTree.el

        instance.isMounted = true
      } else {
        // update
        console.log("update when responsive data is changed")
        const { proxy } = instance
        const prevSubtree = instance.subTree
        const subTree = instance.render.call(proxy)
        instance.subTree = subTree
        patch(prevSubtree, subTree, container, instance, anchor)
      }
    })
  }

  function processElement(
    n1,
    n2: any,
    container: HTMLElement,
    parentComponent: HTMLElement,
    anchor,
  ) {
    // implement
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement n1, n2", { n1, n2 })

    // patch props
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el) // n2 may have no el since el is attached in mountElement

    patchChildren(n1, n2, container, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(n2.children, container, parentComponent, anchor)
      } else {
        patchKeyedChildren(
          n1.children,
          n2.children,
          n2.el, // note: container is changed to n2.el
          parentComponent,
          anchor,
        )
      }
    }
  }

  function patchKeyedChildren(
    c1: any,
    c2: any,
    container,
    parentComponent,
    parentAnchor,
  ) {
    let i = 0
    const l1 = c1.length
    const l2 = c2.length
    let e1 = l1 - 1
    let e2 = l2 - 1

    // Part 1: narrow the diff range by get same-type vnode out of picture
    // go from left hand
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      i++
    }

    // go from right hand
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      e1--
      e2--
    }

    // Part 2. handle diff at left or right end: new children is more than new children
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1 // bug fixed
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    }
    // Part 3. also handle diff at left or right end: new children is fewer than old children
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // Part 4. handle diff in the middle:  move existing  / remove old / add new dom nodes

      // 's' for 'start', s1 and s2 are the starting index of difference range in the middle
      let s1 = i
      let s2 = i

      const toBePatched = e2 - s2 + 1
      let patched = 0
      const keyToNewIndexMap = new Map()

      // init newIndexToOldIndexMap, which maps its own index to old index(its value)
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
      // `move` represents if there is ANY new child that is just old child that moved position
      let moved = false
      let maxNewIndexSoFar = 0

      // iterate over new children to construct keyToNewIndexMap
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      // iterate over old children to patch
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        // remove old child that has no counterpart in new children
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        // key is undefined or null
        let newIndex
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          // #################
          // ### REMOVE OLD DOM
          // #################
          console.log("update: remove dom")
          hostRemove(prevChild.el)
        } else {
          if (newIndex > maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      // get indices of new children that don't need moving
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      let j = increasingNewIndexSequence.length - 1

      // iterate over new children that need patching
      // (backward so that we could use insert more easily)
      for (let i = toBePatched - 1; i > -1; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        // if the corresponding old index does not exist (equals to initial value 0)
        // then just create new dom node using patch()
        if (newIndexToOldIndexMap[i] === 0) {
          // #################
          // ### ADD NEW DOM
          // #################
          console.log("update: add dom")
          patch(null, nextChild, container, parentAnchor, anchor)
        }
        // otherwise go into move logic
        else if (moved) {
          // if new child's index is not in increasingNewIndexSequence, it needs to move
          if (i !== increasingNewIndexSequence[j]) {
            // #################
            // ### MOVE EXISTING DOM
            // #################
            console.log("update: moving dom")
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
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
    anchor,
  ) {
    const { children, props, shapeFlag } = vnode
    // const el = (vnode.el = document.createElement(vnode.type) as HTMLElement)
    const el = (vnode.el = hostCreateElement(vnode.type) as HTMLElement)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor)
    }

    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    hostInsert(el, container, anchor)
    // container.append(el)
  }

  function mountChildren(
    children: any,
    container: any,
    parentComponent,
    anchor,
  ) {
    children.forEach((child) =>
      patch(null, child, container, parentComponent, anchor),
    )
  }

  return {
    createApp: createAppAPI(render),
  }
}
