import { h, renderSlots } from "../../lib/mini-vue.esm.js"

export const Foo = {
  name: "Foo",
  setup(props, { emit }) {},

  render() {
    const foo = h("span", { style: "border: 1px solid blue" }, "foo base")
    console.log("this.$slots", this.$slots, renderSlots(this.$slots))
    return h("div", { class: "foo-component-root" }, [
      renderSlots(this.$slots, "header", {
        headerInfo: "`info inside Foo passed to App`",
      }),
      foo,
      renderSlots(this.$slots, "footer"),
    ])
  },
}
