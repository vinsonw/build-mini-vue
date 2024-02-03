import { effect } from "../effect"
import { ref, isRef, unref, proxyRefs } from "../ref"

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

  it("unref", () => {
    const foo = 1
    const fooRef = ref(foo)
    expect(isRef(unref(fooRef))).toBe(false)
    expect(unref(foo)).toBe(1)

    const bar = { baz: 1 }
    const barRef = ref(bar)

    expect(isRef(unref(barRef))).toBe(false)
    expect(unref(bar)).toBe(bar)
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "vinson",
    }

    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe("vinson")

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})
