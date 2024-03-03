export function initSlots(instance, children) {
  // at the moment, children other than ShapeFlags.TEXT_CHILDREN and ShapeFlags.ARRAY_CHILDREN is
  // not processed in createVNode
  // instance.slots = children
  instance.slots = normalizeSlot(children)
}

function normalizeSlot(children) {
  return Array.isArray(children) ? children : [children]
}
