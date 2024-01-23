import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
function createReactiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}
