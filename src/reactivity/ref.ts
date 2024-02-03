import { hasChanged, isObject } from "../shared"
import { trackEffects, triggerEffects, isTracking } from "./effect"
import { reactive } from "./reactive"
class RefImpl {
  private _value: any
  public dep: Set<unknown>
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (!hasChanged(this._rawValue, newValue)) return
    this._rawValue = newValue
    this._value = convert(newValue)
    triggerEffects(this.dep)
  }
}

export function trackRefValue(refObj) {
  if (isTracking()) {
    trackEffects(refObj.dep)
  } else {
    // does nothing
    // for example:
    // one not tracking scenario:
    // expect(refObj.value).toBe(1)
    // -------^^^^^^^^^^^^
  }
}

export function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(value: any): any {
  return new RefImpl(value)
}

export function isRef(maybeRef: any) {
  if (!isObject(maybeRef)) return false
  return !!maybeRef.__v_isRef
}

export function unRef(maybeRef: any) {
  if (!isRef(maybeRef)) return maybeRef

  return maybeRef.value
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },

    set(target, key, value) {
      // 1. only under this criterion, `.value` is set
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        // 2. otherwise, old value is replaced by new value, including old ref being replaced by new ref since `ref` cannot be nested
        return Reflect.set(target, key, value)
      }
    },
  })
}
