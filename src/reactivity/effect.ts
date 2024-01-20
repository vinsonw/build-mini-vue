class ReactiveEffect {
  private _fn: Function
  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    // during execution of this._fn(),
    // get() of proxy in _fn would be triggered,
    // during which track(target, key) is called, then activeEffect is collected
    this._fn()
  }
}

const targetMap = new WeakMap()

export function track(target, key) {
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  deps.add(activeEffect)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let deps = depsMap.get(key)
  for (const effect of deps) {
    effect.run()
  }
}

let activeEffect
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}