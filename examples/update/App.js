import { h, ref } from "../../lib/mini-vue.esm.js"

export const App = {
  // no support for .vue yet
  name: "App",

  setup() {
    const count = ref(0)

    const onClick = () => {
      console.log("onClick")
      count.value++
      console.log("count", count.value)
    }
    return {
      onClick,
      count,
    }
  },

  render() {
    // ui
    console.log("render() called")
    return h(
      "div",
      {
        id: this.count,
      },
      [
        h("div", {}, "count" + this.count),
        h("button", { onClick: this.onClick }, "increase"),
      ],
    )
  },
}
