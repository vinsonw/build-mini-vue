import { createVNode } from "../vnode"
import { Fragment } from "../vnode"

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    if (typeof slot === "function") {
      // Since normalizeObjectSlots() will make sure that slot(props) returns value of type `vnode[]`
      // and vnode[] could not be processed by `patch(vnode, container)`,
      // we need to wrap `slot(props)` with a `div` to create a `vnode`
      // return slot(props) // not working

      // now use Fragment to replace div for one dom node saving
      return createVNode(Fragment, { class: "slot" }, slot(props))
    }
  }
}
