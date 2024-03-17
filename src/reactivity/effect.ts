import { extend } from "../shared"

let activeEffect: ReactiveEffect
let shouldTrack = false

export class ReactiveEffect {
  private _fn: Function
  public deps: any[] = []
  public active: boolean = true
  public onStop?: () => void
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
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

  trackEffects(dep)
}

export function trackEffects(dep) {
  // notice when trigger() `effect.run()` will trigger track again, this prevents that since activeEffect is already in the dep
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep: Set<any>) {
  for (const effect of dep) {
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
