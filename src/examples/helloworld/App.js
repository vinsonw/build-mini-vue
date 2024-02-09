export const App = {
  // no support for .vue yet

  render() {
    // ui
    return h("div", "hello, " + this.msg)
  },

  setup() {
    // composition api
    return {
      msg: "hello",
    }
  },
}
