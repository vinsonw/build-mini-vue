import { camelize, capitalize } from "../shared"
export function emit(instance: any, event: string, ...args) {
  const { props } = instance

  const toHandlerKey = (str: string) => (str ? "on" + capitalize(str) : "")
  // camelize: add-one -> addOne
  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}
