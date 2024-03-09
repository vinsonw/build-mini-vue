import {
  h,
  createTextVNode,
  getCurrentInstance,
} from "../../lib/mini-vue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  // no support for .vue yet
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "currentInstance demo"), h(Foo)])
  },

  setup() {
    const instance = getCurrentInstance()
    console.log(instance)
  },
}
