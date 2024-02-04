import { computed } from "../computed"
import { reactive } from "../reactive"

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    })

    const cAge = computed(() => user.age + 1)
    expect(cAge.value).toBe(11)
  })

  it("should compute lazily", () => {
    const foo = reactive({
      bar: 1,
    })

    const getter = jest.fn(() => foo.bar + 1)

    const cBar = computed(getter)

    expect(getter).not.toHaveBeenCalled()

    expect(cBar.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not computed again when access cBar.value
    cBar.value
    expect(getter).toHaveBeenCalledTimes(1)

    foo.bar += 1
    // cBar.value is not accessed again, thus getter should not be called again
    expect(getter).toHaveBeenCalledTimes(1)
    // But since foo.bar is set, ComputedRefImpl instance was set dirty again through scheduler.
    // Now when cBar.value is accessed, getter would be called again
    expect(cBar.value).toBe(3) // cBar.value is accessed
    expect(getter).toHaveBeenCalledTimes(2) // getter gets called again

    // now ComputedRefImpl instance is clean again

    expect(cBar.value).toBe(3) // cBar.value is accessed, but return cache
    expect(getter).toHaveBeenCalledTimes(2) // getter wont't be called
  })
})
