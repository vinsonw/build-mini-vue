export const extend = Object.assign

export const isObject = (param: unknown) => {
  return typeof param === "object" && param !== null
}

export const hasChanged = (oldValue, newValue) => {
  return !Object.is(oldValue, newValue)
}
