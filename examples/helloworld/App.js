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
        class: ["mini", "vue"],
        onClick() {
          console.log("clicked!")
        },
        onMouseenter() {
          console.log("mouse entered!")
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
      // "hello, " + this.msg,
      // "hello, " + "mini-vue",
      // [
      //   h("p", { class: "child-p-1" }, "as child 1"),
      //   h("p", { class: "child-p-2" }, "as child 2"),
      // TODO not working for nested component
      // h(Another),
      // ],
    )
  },

  setup() {
    // composition api
    return {
      msg: "vinson",
    }
  },
}
