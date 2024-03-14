import { createRenderer } from "../runtime-core"

function createElement(el) {
  console.log("---createElement")
  return document.createElement(el)
}

function patchProp(el, key, val) {
  console.log("---patchProp")
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, val)
  } else {
    el.setAttribute(key, val)
  }
}

function insert(el, parent) {
  console.log("---insert")
  parent.append(el)
}

const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
})

export function createApp(rootComponent: any) {
  return renderer.createApp(rootComponent)
}

export * from "../runtime-core"
