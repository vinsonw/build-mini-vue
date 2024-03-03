import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}

export function patch(vnode, container) {
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(initialVnode: any, container: any) {
  const instance = createComponentInstance(initialVnode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance, initialVnode, container) {
  const { proxy } = instance
  // so-called subTree is just root vnode of a component
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)

  // root dom node of a component is the root component of subtree
  initialVnode.el = subTree.el
}

function processElement(vnode: any, container: any) {
  // implement
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const { children, props, shapeFlag } = vnode
  const el = (vnode.el = document.createElement(vnode.type) as HTMLElement)

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
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

function mountChildren(children: any, container: any) {
  children.forEach((child) => patch(child, container))
}
