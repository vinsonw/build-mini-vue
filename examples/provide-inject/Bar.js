import {
  h,
  renderSlots,
  inject,
  createTextVNode,
} from "../../lib/mini-vue.esm.js"

export const Bar = {
  name: "Bar",
  setup() {
    const bazVal = inject("baz", "baz default value")
    const baz2Val = inject("baz2", "baz2 default value")
    const baz3Val = inject("baz3", () => "baz3 default value")
    return { bazVal, baz2Val, baz3Val }
  },

  render() {
    return h("div", { class: "bar" }, [
      createTextVNode(
        "bar injected: " + `${this.bazVal} - ${this.baz2Val} - ${this.baz3Val}`,
      ),
    ])
  },
}
