import { h } from "../../lib/mini-vue.esm.js"

const Foo = {
  setup(props) {
    // props.count exists
    console.log("Foo props:", props)
    // should emit a warning about props being readonly
    // props.count++
  },

  render() {
    return h("div", {}, "foo: " + this.count)
  },
}

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
      [h("div", {}, "hi, " + this.msg), h(Foo, { count: 1 })],
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
