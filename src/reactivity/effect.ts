import { extend } from "../shared"

let activeEffect: ReactiveEffect
let shouldTrack = false

class ReactiveEffect {
  private _fn: Function
  public deps: any[] = []
  public active: boolean = true
  public onStop?: () => void
  public scheduler?: () => void
  constructor(fn) {
    this._fn = fn
  }
  run() {
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this
    // during execution of this._fn(),
    // get() of proxy in _fn would be triggered,
    // during which track(target, key) is called, then activeEffect is collected
    const result = this._fn()
    shouldTrack = false
    return result
  }

  stop() {
    if (!this.active) return
    cleanupEffect(this)
    if (this.onStop) {
      this.onStop()
    }
    this.active = false
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new WeakMap()

export function track(target, key) {
  if (!isTracking()) return
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // notice when trigger() `effect.run()` will trigger track again, this prevents that since activeEffect is already in the dep
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let deps = depsMap.get(key)
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
