export class Entity {

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
export class Sprite {

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


export class Wall extends Entity {

  draw() {
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.rect(this.x, this.y, this.w, this.h)
    ctx.fill()
    ctx.closePath()
  }

}
