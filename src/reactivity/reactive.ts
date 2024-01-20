import { track, trigger } from "./effect"
export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      // collect dep
      track(target, key)
      return res
    },

    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      // trigger dep
      trigger(target, key)
      return res
    },
  })
}
