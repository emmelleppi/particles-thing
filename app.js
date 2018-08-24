import { DrawRect, DrawCannon, DrawExplosion } from './DrawingTools.js'

class Rect {
  constructor({
    x0,
    y0,
    x1,
    y1,
    w = 0,
    h = 0,
    angleVar = Math.PI * 0.5,
    moduleVar
  }) {

    this.angleVar = angleVar

    this.w = w
    this.h = h

    this.x0 = x0
    this.y0 = y0

    this.x1 = x1 || x0
    this.y1 = y1 || y0

    this.time = 0

    this.particles = []
    this.particleType = randomMember(['triangle', 'circle', 'square'])

    this.angle = Math.atan2(this.y1 - this.y0, this.x1 - this.x0)

    this.module = moduleVar || Math.sqrt(
      Math.pow(this.x0 - this.x1, 2) + Math.pow(this.y0 - this.y1, 2)
    )

  }

  onMouseMove(e) {
    let anyCollision = false

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      if (
        e.clientX >= particle.x && e.clientX <= particle.x + particle.w
        &&
        e.clientY >= particle.y && e.clientY <= particle.y + particle.h
      ) {
        anyCollision = true
        particle.onMouseEnter(e)
      } else {
        particle.onMouseLeave(e)
      }

    }

    if (anyCollision) {
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'default'
    }
  }

  wireframe() {
    ctx.strokeStyle = 'red'
    ctx.strokeRect(this.x, this.y, this.w, this.h)
  }

  getEmitterArc() {
    let rad = randomFloatRange(this.angle - this.angleVar / 2, this.angle + this.angleVar / 2)

    const [ax, ay] = [
      Math.abs(this.module) * Math.cos(rad), Math.abs(this.module) * Math.sin(rad)
    ]

    return [
      ax,
      ay
    ]
  }

  step(elapsed) {
    if (elapsed - this.time > 10) {

      const [ax, ay] = this.getEmitterArc()

      this.particles.push(new Particle({
        x: randomRange(this.x0, this.x0 + this.w),
        y: randomRange(this.y0, this.y0 + this.h),
        ax,
        ay,
        type: this.particleType,
        sprite: randomMember(['./particle.png', './particle-2.png'])
      }))
      this.time = elapsed
    }

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i]
      if (particle.life >= particle.lifetime) {
        this.particles.splice(i, 1)
      } else {
        particle.step(1)
      }
    }

  }

  draw() {
    this.particles.map(particle => particle.draw())
  }
}

class Entity {

  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  getTopLeft = () => [this.x, this.y]
  getTopRight = () => [this.x + this.w, this.y]
  getBottomLeft = () => [this.x, this.y + this.h]
  getBottomRight = () => [this.x + this.w, this.y + this.h]

  getBoundingBox = () => ({
    topLeft: this.getTopLeft(),
    topRight: this.getTopRight(),
    bottomLeft: this.getBottomLeft(),
    bottomRight: this.getBottomRight(),
  })
}

let spritesCache = {}
class Sprite {

  constructor(sprite) {

    if (typeof spritesCache[sprite] !== 'undefined') {
      this.image = spritesCache[sprite]
      this.loaded = true
      return
    }

    this.image = new Image()
    this.image.src = sprite
    this.image.onload = () => {
      this.loaded = true
    }

    spritesCache[sprite] = this.image
  }

}

let col = 0
class Particle extends Entity {
  constructor({ x, y, ax, ay, vx = 0, vy = 0, type, w, h, sprite }) {

    super(x, y, w, h)
    this.lifetime = 200
    this.life = 0

    const rand = randomRange(0, 20)
    this.w = w || rand
    this.h = h || rand

    this.ax = ax
    this.ay = ay

    this.vx = vx
    this.vy = vx

    this.col = col++
    this.type = type

    this.sprite = sprite ? new Sprite(sprite) : null

    collisionController.pushCollidee(this)

    this.rotation = parseInt(Math.random() * 45, 10) * Math.PI / 180
  }


  onMouseEnter() {
    this.clicked = true
  }

  onMouseLeave() {
    this.clicked = false
  }

  step(elapsed) {
    this.vx += (this.ax * elapsed / 50) + gx
    this.vy += (this.ay * elapsed / 50) + gy

    this.x += (this.vx * elapsed / 50)
    this.y += (this.vy * elapsed / 50)

    this.life++
    this.lifePercent = (this.life * 100) / this.lifetime
  }

  gino = x => (-1 / 2500) * x ** 2 + (1 / 25) * x

  draw() {
    const scale = this.gino(this.lifePercent)

    ctx.beginPath()
    ctx.fillStyle = `hsla(${this.col}, 100%, 40%, ${scale})`

    const w = this.w * scale
    const h = this.h * scale

    const x = this.x + this.w - w / 2
    const y = this.y + this.h - h / 2

    if (this.sprite) {

      if (this.sprite.loaded) {
        ctx.globalAlpha = scale
        ctx.drawImage(this.sprite.image, this.x, this.y)
        ctx.globalAlpha = 1
      }

      return null

    }

    if (this.type === 'triangle') {

      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x + this.w / 2, this.y - this.h)
      ctx.lineTo(this.x + this.w, this.y)
      ctx.closePath()

    } else if (this.type === 'circle') {
      ctx.arc(this.x, this.y, this.w * scale, 0, Math.PI * 2)
    } else {
      ctx.rect(this.x, this.y, this.w, this.h)
    }


    ctx.fill()
  }

}

class Wall extends Entity {

  draw() {
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.rect(this.x, this.y, this.w, this.h)
    ctx.fill()
    ctx.closePath()
  }

}

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
