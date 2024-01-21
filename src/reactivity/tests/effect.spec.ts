import { reactive } from "../reactive"
import { effect } from "../effect"

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    user.age++
    expect(nextAge).toBe(12)
  })

  it("should return runner when calling effect", () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })

    expect(foo).toBe(11)
    const res = runner()
    expect(res).toBe("foo")
    expect(foo).toBe(12)
  })

  it("scheduler", () => {
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    // now effect() accepts 2 params, (fn, options?: {scheduler})
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    // scheduler should not be called yet
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // trigger setter
    obj.foo++
    // scheduler now should be called once
    expect(scheduler).toHaveBeenCalledTimes(1)
    // but scheduler didn't call fn, so dummy is not changed
    expect(dummy).toBe(1)
    // fn is called
    run()
    // now dummy is changed
    expect(dummy).toBe(2)
  })

  it.skip("stop", () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    obj.prop = 3
    expect(dummy).toBe(2)

    runner()
    expect(dummy).toBe(3)
  })
})
