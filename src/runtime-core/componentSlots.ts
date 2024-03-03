import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance, children) {
  // at the moment, children other than ShapeFlags.TEXT_CHILDREN and ShapeFlags.ARRAY_CHILDREN is
  // not processed in createVNode
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
