import { h } from "../../lib/mini-vue.esm.js"
export const Foo = {
  setup(props, { emit }) {
    // props.count exists
    console.log("Foo props:", props)
    // should emit a warning about props being readonly
    // props.count++
    const emitAdd = () => {
      emit("add", 1, 2)
      emit("add-one", 3)
    }

    return {
      emitAdd,
    }
  },

  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd",
    )
    const foo = h("p", {}, "foo")
    return h("div", {}, [foo, btn])
  },
}
