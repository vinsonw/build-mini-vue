import { createComponentInstance, setupComponent } from "./component"
import { isObject } from "../shared"

export function render(vnode, rootContainer) {
  // patch
  patch(vnode, rootContainer)
}

export function patch(vnode, container) {
  console.log("vnode.type", vnode.type)
  if (typeof vnode.type === "string") {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
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

function setupRenderEffect(instance, container) {
  const { proxy } = instance
  // so-called subTree is just root vnode of a component
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}

function processElement(vnode: any, container: any) {
  // implement
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const { children, props } = vnode
  const el = document.createElement(vnode.type) as HTMLElement

  if (typeof children === "string") {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(children, el)
  }

  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  // debugger
  container.append(el)
}

function mountChildren(children: any, container: any) {
  children.forEach((child) => patch(child, container))
}
