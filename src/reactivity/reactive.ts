import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}
function createReactiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}

export function isReactive(value) {
  return !!value[ReactiveFlag.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY]
}
