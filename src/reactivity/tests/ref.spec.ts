import { effect } from "../effect"
import { ref, isRef, unRef } from "../ref"

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it("should be reactive", () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value, wont't trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    })

    let dummy

    effect(() => {
      dummy = a.value.count
    })

    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it("isRef", () => {
    const foo = 1
    const fooRef = ref(foo)
    expect(isRef(fooRef)).toBe(true)
    expect(isRef(foo)).toBe(false)

    const bar = { baz: 1 }
    const barRef = ref(bar)
    expect(isRef(barRef)).toBe(true)
    expect(isRef(bar)).toBe(false)
  })

  it("unRef", () => {
    const foo = 1
    const fooRef = ref(foo)
    expect(isRef(unRef(fooRef))).toBe(false)
    expect(unRef(foo)).toBe(1)

    const bar = { baz: 1 }
    const barRef = ref(bar)

    expect(isRef(unRef(barRef))).toBe(false)
    expect(unRef(bar)).toBe(bar)
  })
})
