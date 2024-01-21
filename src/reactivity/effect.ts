import { extend } from "../shared"
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
    activeEffect = this
    // during execution of this._fn(),
    // get() of proxy in _fn would be triggered,
    // during which track(target, key) is called, then activeEffect is collected
    return this._fn()
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
}

const targetMap = new WeakMap()

export function track(target, key) {
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

  if (activeEffect) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
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

let activeEffect: ReactiveEffect
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
