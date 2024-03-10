import { h, createTextVNode, provide } from "../../lib/mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  // no support for .vue yet
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "provide-inject demo"), h(Foo)])
  },

  setup() {
    provide("baz", "app provide baz")
    provide("baz2", "app provide baz2")
  },
}
