import { Entity } from './utility.js'
import { Particle } from './Particle.js'

export class Rect {
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
    let i
    const l = this.particles.length
    for (i = 0; i < l; i++) {
      this.particles[i].draw()
    }
  }
}
