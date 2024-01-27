import { isObject } from "../shared"
import { track, trigger } from "./effect"
import { ReactiveFlag, reactive, readonly } from "./reactive"

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    // support nested readonly() and reactive()
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    // collect dep
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // trigger dep
    trigger(target, key)
    return res
  }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`value of ${key} could not be set, since target is readonly!`)
    return true
  },
}
