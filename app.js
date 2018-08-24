import { Wall } from './utility.js'
import { Rect } from './Emitter.js'
import { DrawRect, DrawCannon, DrawExplosion } from './DrawingTools.js'
class App {

  constructor() {
    this.active = 'explosion'

    this.emitters = []

    this.walls = [
      new Wall(canvas.width / 2 - 15, canvas.height / 2 - 100, 30, 200),
      new Wall(canvas.width / 2 + 200, canvas.height / 2 - 50, 30, 100),
    ]

    this.walls.forEach(collisionController.pushCollider)
  }

  handleNewEmitter = (args) => {
    this.emitters.push(new Rect(args))
  }

  loop(elapsed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    collisionController.step(elapsed)

    if (this.drawingTool) {
      this.drawingTool.draw()
    }

    // myDd.draw()
    this.emitters.forEach(emitter => {
      emitter.step(elapsed)
      emitter.draw()
    })

    this.walls.forEach(wall => {
      wall.draw()
    })

    requestAnimationFrame(this.loop.bind(this))
  }

  handleClick = (e) => {
    e.preventDefault()
    const tool = e.target.dataset.p
    this.active = tool
    this.update()
    return false
  }

  bindUI() {
    $('button').on('click', this.handleClick)
  }

  update() {

    if (this.active) {
      switch (this.active) {

        case 'cannon':
          this.drawingTool = new DrawCannon(this.handleNewEmitter.bind(this))
          break
        case 'rect':
          this.drawingTool = new DrawRect(this.handleNewEmitter.bind(this))
          break
        case 'explosion':
          this.drawingTool = new DrawExplosion(this.handleNewEmitter.bind(this))
          break

      }
    }

    console.log(this.active)

    $('button').removeClass('active')
    $(`[data-p=${this.active}]`).addClass('active')
  }

  init() {
    console.log('app init')
    this.bindUI()
    this.update()
  }

}

const app = new App()
app.init()
app.loop()
