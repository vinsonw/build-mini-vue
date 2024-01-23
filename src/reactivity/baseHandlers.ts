import { track, trigger } from "./effect"

function createGetter(isReadonly?: boolean) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
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
