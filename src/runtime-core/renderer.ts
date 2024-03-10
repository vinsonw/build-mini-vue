import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vnode"

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer, null)
}

export function patch(vnode, container, parentComponent) {
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

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVnode: any, container: any, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance
  // so-called subTree is just root vnode of a component
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container, instance)

  // root dom node of a component is the root component of subtree
  initialVnode.el = subTree.el
}

function processElement(vnode: any, container: any, parentComponent) {
  // implement
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const { children, props, shapeFlag } = vnode
  const el = (vnode.el = document.createElement(vnode.type) as HTMLElement)

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  }
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  for (const key in props) {
    const val = props[key]
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  // debugger
  container.append(el)
}

function mountChildren(children: any, container: any, parentComponent) {
  children.forEach((child) => patch(child, container, parentComponent))
}
