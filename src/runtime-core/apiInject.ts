import { getCurrentInstance } from "./component"

export function provide(key, value) {
  const currentInstance = getCurrentInstance()
  if (!currentInstance) return

  let { provides } = currentInstance
  const parentProvides =
    currentInstance.parent && currentInstance.parent.provides
  // Since user called `provide`, they want to modify the provides, thus create a new provides object,
  // otherwise just use the initial parentProvides
  // note: here use prototype chain to reduce the number of objects need to be created
  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }
  provides[key] = value
}

export function inject(key, defaultValue) {
  const currentInstance = getCurrentInstance()
  if (!currentInstance) return

  const { provides } = currentInstance
  if (key in provides) {
    return provides[key]
  } else if (defaultValue) {
    if (typeof defaultValue === "function") {
      return defaultValue()
    }
    return defaultValue
  }
}
