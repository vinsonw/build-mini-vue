import { isProxy, isReactive, isReadonly, reactive } from "../reactive"

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReactive(original)).toBe(false)
    // `observed` could not be reactive and readonly at the same time
    expect(isReactive(observed)).toBe(true)
    expect(isReadonly(observed)).toBe(false)
    expect(isProxy(observed)).toBe(true)
  })

  it("should be nested reactive by default", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }

    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReadonly(observed.nested)).toBe(false)
    expect(isReadonly(observed.array)).toBe(false)
  })
})
