import { h } from "../../lib/mini-vue.esm.js"

const Another = {
  render() {
    return h(
      "div",
      { class: "another" },
      h("p", { class: "another-child" }, "p in another component"),
    )
  },

  setup() {
    return ""
  },
}

export const App = {
  // no support for .vue yet

  render() {
    // ui
    window.self = this
    return h(
      "div",
      {
        id: "root",
        class: ["mini", "vue"],
      },
      "hello, " + this.msg,
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
