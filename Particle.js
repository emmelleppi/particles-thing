import { Entity, Sprite } from './utility.js'

let col = 0
export class Particle extends Entity {
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
