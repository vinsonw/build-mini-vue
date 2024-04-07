import { createRenderer } from "../runtime-core"

function createElement(el) {
  console.log("---createElement")
  return document.createElement(el)
}

function patchProp(el, key, prevVal, newVal) {
  console.log("---patchProp")
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.removeEventListener(event, prevVal)
    el.addEventListener(event, newVal)
  } else {
    if (newVal === undefined || newVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, newVal)
    }
  }
}

function insert(el, parent, anchor) {
  console.log("---insert")
  parent.insertBefore(el, anchor || null)
}

function remove(el) {
  console.log("---remove")
  const parent = el.parentNode
  if (parent) {
    parent.removeChild(el)
  }
}

function setElementText(container, text) {
  container.textContent = text
}

const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
})

export function createApp(rootComponent: any) {
  return renderer.createApp(rootComponent)
}

export * from "../runtime-core"
