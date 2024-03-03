import { h } from "../../lib/mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  // no support for .vue yet
  name: "App",
  render() {
    // ui
    window.self = this
    return h(
      "div",
      {
        id: "root",
        class: ["app-component-root"],
        onClick() {
          console.log("clicked!")
        },
      },
      [
        h("div", {}, "hi, " + this.msg),
        h(Foo, {
          count: 1,
          // add -> onAdd
          onAdd(a, b) {
            console.log("`add` listener on Foo in App", a + b)
          },
          // add-foo -> onAddOne
          onAddOne(c) {
            console.log("`add-one` listener on Foo in App", c + 1)
          },
        }),
      ],
    )
  },

  setup() {
    // composition api
    return {
      msg: "vinson",
    }
  },
}
