import { isReactive, isReadonly, reactive } from "../reactive"

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
  })
})
