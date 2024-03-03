import { h } from "../../lib/mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  // no support for .vue yet
  name: "App",
  render() {
    const foo = h(Foo, {}, [
      h("p", {}, "slotted content1"),
      h("p", {}, "slotted content2"),
    ])
    return h("div", { class: "app-component-root" }, [foo])
  },

  setup() {
    // composition api
    return {
      msg: "vinson",
    }
  },
}
