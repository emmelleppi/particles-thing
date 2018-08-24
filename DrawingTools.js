let dir = 1
function incrementTo(from, to, increment) {

  console.log(from, to, increment, from + (increment * dir))

  const possibleNewFrom = from + (increment * dir)

  if (possibleNewFrom > to || possibleNewFrom <= 0) {
    dir *= -1
  }

  return from + (increment * dir)

}

class DrawingTool {
  constructor() {
    this.events = 'mousedown.drawingTool mouseup.drawingTool mousemove.drawingTool'
    $(window).off('.drawingTool')
    $(window).on(this.events, this.handleEvents.bind(this))

    this.active = false

    this.loop()
  }

  handleEvents(e) {
    let callback = () => console.warn('unhandled event')

    switch (e.type) {
      case 'mousedown':
        callback = this.handleMouseDown
        break
      case 'mousemove':
        callback = this.handleMouseMove
        break
      case 'mouseup':
        callback = this.handleMouseUp
        break
    }

    return callback(e)
  }

  loop() {
    if (typeof this.update === 'function' && this.active) {
      this.update()
      this.draw()
    }
    requestAnimationFrame(this.loop.bind(this))
  }

}

export class DrawRect extends DrawingTool {
  constructor(callback) {
    super(callback)
    this.onDraw = callback

    this.x = 0
    this.y = 0

    this.w = 0
    this.h = 0
  }

  handleMouseDown = (e) => {
    this.x = e.clientX
    this.y = e.clientY
    this.w = 0
    this.h = 0

    this.active = true
  }

  handleMouseMove = (e) => {
    if (this.active) {

      this.w = e.clientX - this.x
      this.h = e.clientY - this.y

    }
  }

  handleMouseUp = (e) => {
    if (this.active) {
      this.onDraw({ x0: this.x, y0: this.y, w: this.w, h: this.h })
    }

    this.active = false
  }


  draw() {
    if (!this.active) return null

    ctx.strokeStyle = 'red'
    ctx.strokeRect(this.x, this.y, this.w, this.h)
  }

}

export class DrawCannon extends DrawingTool {
  constructor(callback) {
    super(callback)

    this.x0 = 0
    this.y0 = 0

    this.x1 = 0
    this.y1 = 0

    this.onDraw = callback

    this.angle = 0
  }

  handleMouseDown = e => {
    this.x0 = e.clientX
    this.y0 = e.clientY

    this.x1 = e.clientX
    this.y1 = e.clientY

    this.active = true
  }

  handleMouseUp = (e) => {
    if (this.active && typeof this.onDraw === 'function') {
      this.onDraw({ ...this, angleVar: this.angle })
    }

    this.active = false
  }

  handleMouseMove = e => {
    this.x1 = e.clientX
    this.y1 = e.clientY
  }

  draw() {
    if (!this.active) return false

    // draw start point
    ctx.beginPath()
    ctx.rect(...center(this.x0, this.y0, 4, 4))
    ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()

    // angle

    const angle = Math.atan2(this.y1 - this.y0, this.x1 - this.x0)

    ctx.beginPath()
    ctx.moveTo(this.x0, this.y0)
    ctx.arc(this.x0, this.y0, 30, angle - this.angle / 2, angle + this.angle / 2)
    ctx.lineTo(this.x0, this.y0)
    ctx.stroke()
    ctx.closePath()

    // draw line
    ctx.beginPath()
    ctx.moveTo(this.x0, this.y0)
    ctx.lineTo(this.x1, this.y1)
    ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()
  }

  update() {
    this.angle = incrementTo(this.angle, Math.PI, Math.PI / 45)
    console.log('yo update cannon', this.angle)
  }

}

export class DrawExplosion extends DrawCannon {

  handleMouseUp = (e) => {
    if (this.active && typeof this.onDraw === 'function') {
      this.onDraw({
        ...this,
        ax: randomRange(-10, 10),
        ay: randomRange(-10, 10),
        angleVar: Math.PI * 2
      })
    }

    this.active = false
  }

  draw() {
    if (!this.active) return false

    const mod = Math.sqrt(
      Math.pow(this.x0 - this.x1, 2) + Math.pow(this.y0 - this.y1, 2)
    )

    // draw start point
    ctx.beginPath()
    ctx.rect(...center(this.x0, this.y0, 4, 4))
    ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.arc(this.x0, this.y0, mod, 0, Math.PI * 2)
    ctx.stroke()
    ctx.closePath()

    // draw line
    ctx.beginPath()
    ctx.moveTo(this.x0, this.y0)
    ctx.lineTo(this.x1, this.y1)
    ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()
  }

}
