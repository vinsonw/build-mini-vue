import { isReactive, isReadonly, readonly } from "../reactive"

describe("readonly", () => {
  it("happy path", () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    expect(isReadonly(original)).toBe(false)
    expect(isReadonly(wrapped)).toBe(true)
    // `wrapped` could not be reactive and readonly at the same time
    expect(isReactive(wrapped)).toBe(false)
  })

  it("should warn when calling set", () => {
    console.warn = jest.fn()
    const user = readonly({ age: 18 })

    user.age = 11
    expect(console.warn).toBeCalled()
  })
})
