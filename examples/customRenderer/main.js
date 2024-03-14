import { createRenderer } from "../../lib/mini-vue.esm.js"
import { App } from "./App.js"

// based on PixiJS 6.1.3
const game = new PIXI.Application({
  width: 600,
  height: 600,
})

document.body.append(game.view)

// create a custom renderer for pixijs
const render = createRenderer({
  createElement(type) {
    if (type === "rect") {
      const rect = new PIXI.Graphics()
      rect.beginFill(0xff0000)
      rect.drawRect(0, 0, 100, 100)
      rect.endFill()

      return rect
    }
  },
  patchProp(el, key, val) {
    el[key] = val
  },
  insert(el, parent) {
    console.log("parent === game.stage", parent === game.stage)
    console.log(parent)
    parent.addChild(el)
  },
})

render.createApp(App).mount(game.stage)
