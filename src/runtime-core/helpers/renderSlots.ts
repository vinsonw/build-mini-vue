import { createVNode } from "../vnode"

export function renderSlots(slots) {
  return createVNode("div", { class: "slot" }, slots)
}
