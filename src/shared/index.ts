export const extend = Object.assign

export const isObject = (param: unknown) => {
  return typeof param === "object" && param !== null
}

export const hasChanged = (oldValue, newValue) => {
  return !Object.is(oldValue, newValue)
}

export const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key)

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const camelize = (str: string) =>
  str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ""
  })
