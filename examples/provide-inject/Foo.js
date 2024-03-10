import {
  h,
  renderSlots,
  createTextVNode,
  provide,
} from "../../lib/mini-vue.esm.js"
import { Bar } from "./Bar.js"

export const Foo = {
  name: "Foo",
  setup() {
    provide("baz", "foo provide baz")
    return {}
  },

  render() {
    return h("div", { class: "foo" }, [createTextVNode("foo"), h(Bar)])
  },
}
