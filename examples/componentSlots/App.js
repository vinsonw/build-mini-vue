import { h, createTextVNode } from "../../lib/mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  // no support for .vue yet
  name: "App",
  render() {
    const foo = h(
      Foo,
      {},
      {
        header: ({ headerInfo }) =>
          h("p", {}, "slotted content1 " + headerInfo),
        footer: () => h("p", {}, "slotted content2"),
      },
    )
    return h("div", { class: "app-component-root" }, [
      foo,
      createTextVNode("你好呀"),
    ])
  },

  setup() {
    // composition api
    return {
      msg: "vinson",
    }
  },
}
