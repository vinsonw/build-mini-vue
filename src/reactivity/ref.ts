import { hasChanged, isObject } from "../shared"
import { trackEffects, triggerEffects, isTracking } from "./effect"
import { reactive } from "./reactive"
class RefImpl {
  private _value: any
  public dep: Set<unknown>
  private _rawValue: any
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

export function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(raw: any): any {
  return new RefImpl(raw)
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
