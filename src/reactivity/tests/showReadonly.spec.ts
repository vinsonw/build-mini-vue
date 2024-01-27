import { isReadonly, shallowReadonly } from "../reactive"
describe("shallowReadonly", () => {
  it("should not make nested object reactive", () => {
    const props = shallowReadonly({ foo: { bar: 1 }, baz: 2 })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.foo)).toBe(false)
  })
})
